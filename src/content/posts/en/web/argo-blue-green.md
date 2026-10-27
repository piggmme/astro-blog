---
title: 'Blue/Green Deployment with ArgoCD Rollout'
pubDate: 2025-3-19
description: 'Blue/Green Deployment with ArgoCD Rollout'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]
---

## What is ArgoCD?

ArgoCD is a declarative GitOps CD (Continuous Delivery) tool for Kubernetes. GitOps is a way of managing infrastructure and applications based on declarative configuration stored in a Git repository.

### Key features of ArgoCD

- Declarative deployment:
    It continuously manages the Kubernetes cluster state so that it matches the YAML state declared in the Git repository.

- Automated Sync:
    It automatically detects changes in the Git repository and performs the deployment.

- Visual dashboard:
    You can check deployment status intuitively through the UI.

- Deployment history:
    It also supports easily rolling back to a previous deployment version.

## What is Blue/Green deployment?

Blue/Green deployment is one of the zero-downtime deployment strategies, where you set up two identical environments and swap versions between them.
Kubernetes supports Rolling updates by default, and if you want to use other deployment strategies, you can do so with Rollouts, an add-on project of ArgoCD.

### How it works

1. **Initial state**
   - Blue environment: running the current version (v1)
   - Green environment: on standby

2. **Deploying a new version**
   - Deploy the new version (v2) to the Green environment
   - Meanwhile, the Blue environment keeps running

3. **Testing and switching**
   - Run tests on the Green environment
   - If there are no problems, switch traffic from Blue to Green

4. **After completion**
   - Green becomes the new production environment
   - Blue is kept on standby for rollback

### Pros and cons of Blue/Green deployment

**Pros:**
- Zero-downtime deployment possible
- Fast rollback possible (just switch the traffic back)
- New version can be validated in advance

**Cons:**
- Requires twice the resources
- Complicated when the database schema changes
- Session management needed at the moment of switching

## Blue/Green deployment with ArgoCD Rollout

ArgoCD supports Blue/Green deployment through a controller called Argo Rollouts. You can define and manage the deployment strategy via the Rollout resource.

If you already have a basic Kubernetes environment set up, you can start from step 3.

### 1. Install Helm

Helm acts as the package manager for Kubernetes.

```sh
# mac
brew install helm

# window
choco install kubernetes-helm
```

Check that Helm was installed properly.
```sh
helm version
```

### 2. Create a Helm chart

A Helm chart is a template for managing Kubernetes resources. Run the command below to create a new chart. As a result, a `mychart/` directory is created containing basic templates.

```sh
helm create mychart
```

```bash
mychart/
│── charts/        # Manages subcharts (dependencies)
│── templates/     # Kubernetes resource template files (.yaml)
│── values.yaml    # Default configuration values
│── Chart.yaml     # Chart metadata
│── README.md      # Description file
```

- `Chart.yaml`: metadata file containing the chart's name, version, description, etc.
- `values.yaml`: default configuration values (modifying these lets you easily change the deployment environment)
- `templates/`: template YAML files for Kubernetes deployment (e.g. deployment.yaml, service.yaml, etc.)
- `charts/`: added here if there are subcharts


### 3. Modify `values.yaml`

`values.yaml` defines the default values used by the Helm chart. For example, you can change settings like replicaCount and image.

If the values differ between the production and test environments, you can create `values-prod.yaml` and `values-sandbox.yaml` and add the values there. In that case, values used in both environments can be defined in `values.yaml`.

```yaml
replicaCount: 2

image:
  repository: nginx
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80
```

### 4. Install Argo Rollouts

Install Rollouts into the Kubernetes environment as below.
One thing to watch out for, though: you must not change the namespace (`argo-rollouts`).

```sh
kubectl create namespace argo-rollouts

kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

Installing the Argo Rollouts CLI makes monitoring easier.

```sh
brew install argo-rollouts
```

Check that the pods are running properly with the command below.

```sh
kubectl get pods -n argo-rollouts
```

### 5. Create `rollout.yaml`

> ⚠️ Caution: a rollout controls pods in place of a deployment, which is a basic Kubernetes construct, so if your existing setup had a deployment, you need to move the spec written there into rollout.yaml and then remove that file.

In the basic setup, just change `my-app` to your project name.

- Note: here I wrote the values directly in the template for ease of explanation, but it's better to manage them separately using `values.yaml`.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-app-rollout
spec:
  replicas: 3
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    blueGreen:
      activeService: my-app-service
      previewService: my-app-preview-service
      autoPromotionEnabled: true  # Whether to switch automatically after deployment (false if you want to switch manually)
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:v1  # Image version
        ports:
        - containerPort: 80
```

### 6. Configure `service.yaml`

Argo Rollouts manages traffic with two services.

- The service currently in production
- The service to be newly deployed

When a Blue/Green deployment runs, pods attached to the service to be newly deployed are created, and once all the pods are created, traffic moves all at once from the service currently in production to the newly deployed service.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service # Service currently in production
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-preview-service # Service to be newly deployed
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 7. Deploy a new version

Change the image version in `rollout.yaml` and apply the change, and it gets deployed as the new version.

```yaml
# rollout.yaml
spec:
  template:
    spec:
      containers:
      - name: my-app
        image: my-app:v2  # Changed v1 → v2
```


## Troubleshooting

### Too many pods created during Blue/Green deployment

When deploying a new version, an excessive number of pods were being created.

```yaml
# rollout.yaml
  strategy:
    blueGreen:
      activeService: my-app-service
      previewService: my-app-preview-service
      autoPromotionEnabled: true
      scaleDownDelaySeconds: 30 # Wait 30 seconds before terminating the previous version (old version)
```

I was able to solve it by adding the `scaleDownDelaySeconds` parameter.

The `scaleDownDelaySeconds` parameter
- after the Blue/Green deployment completes successfully,
- specifies, in seconds, how long to wait before terminating the previous version (old version)
- here it's set to 30 seconds

The reasons this delay is needed are

1. To allow a quick rollback if a problem occurs after switching to the new version
2. To let in-flight requests complete safely

For example:
- Switch to the new version (Green) completes
- Keep the previous version (Blue) for 30 seconds
- Terminate the previous version after 30 seconds

### Applying `hpa.yaml`

`HPA` had been applied before applying ArgoCD Rollouts,
but after applying rollouts, `HPA` stopped working properly.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: argoproj.io/v1alpha1  # ✅ Change the target to Rollout
    kind: Rollout  # ✅ Change Deployment → Rollout
    name: my-app-rollout  # ✅ Set to match the actual Rollout name
```

As above, if you apply the newly created `Rollout` instead of `Deployment`, you can see that `HPA` works properly.

### Sending notifications on deployment success/failure

You can define deployment success/failure notification Jobs using ArgoCD Hooks.

- Reference: https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#using-a-hook-to-send-a-slack-message

```yaml
# Deployment success
apiVersion: batch/v1
kind: Job
metadata:
  generateName: notification-success- # Name can be changed as you like
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: notification-success # Name can be changed as you like
        image: curlimages/curl
        command:
          - "curl"
          - "-X"
          - "POST"
          - "--data-urlencode"
          - "payload={\"channel\": \"#somechannel\", \"username\": \"hello\", \"text\": \"배포 성공! ✅\", \"icon_emoji\": \":ghost:\"}"
          - "https://hooks.slack.com/services/..."
      restartPolicy: Never
  backoffLimit: 2
---
# Deployment failure
apiVersion: batch/v1
kind: Job
metadata:
  generateName: notification-fail- # Name can be changed as you like
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: notification-fail # Name can be changed as you like
        image: curlimages/curl
        command:
          - "curl"
          - "-X"
          - "POST"
          - "--data-urlencode"
          - "payload={\"channel\": \"#somechannel\", \"username\": \"hello\", \"text\": \"배포 실패! ❌\", \"icon_emoji\": \":ghost:\"}"
          - "https://hooks.slack.com/services/..."
      restartPolicy: Never
  backoffLimit: 2
```
