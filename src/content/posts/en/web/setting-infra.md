---
title: 'Setting Up a Deployment Environment with an In-House Docker Hub and a k8s-Based Orchestration Tool'
pubDate: 2024-8-20
description: 'Setting Up a Deployment Environment with an In-House Docker Hub and a k8s-Based Orchestration Tool'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]

---

> This post is a write-up of the process the author went through to deploy a service on Docker at work.

## Before we begin...

### 🐳 Docker

Docker is a container-based virtualization platform that makes it easier to deploy and run applications. Docker is a tool that helps maintain consistency between development and production environments, letting you **run an application and its dependencies in isolation within a lightweight virtual environment called a "container"**.

- **Container**: A virtualized package that includes an application and its runtime environment (libraries, dependent packages, etc.). Multiple containers run independently on a single operating system (OS), so even if one has a problem it doesn't affect the others. And because they run on a single operating system (OS), they share its resources, making them better-performing and lightweight.

- **Image**: An immutable file system snapshot that includes an executable application and its configuration. Images are read-only, and containers are created and run based on them.

- **Docker Hub**: A repository for storing and sharing Docker images of various applications. Besides public images, users can also upload their own images.

The reasons for using Docker are as follows.

- **Portability**: It maintains **consistency** between development and production environments, reducing problems like "it works on my machine but not on the server."
- **Lightweight**: It's lighter than a virtual machine (VM), so it uses fewer resources and runs faster.
- **Scalability**: It supports microservice architecture, so you can split an application into various service units and manage them.

Docker is a tool that helps run applications identically across various environments.

### 🚢 Kubernetes

Kubernetes is an open-source container orchestration platform that **automates the deployment, scaling, and management** of containerized applications. It was developed by Google and is now managed by the Cloud Native Computing Foundation (CNCF).

- **Container orchestration**: Refers to the work of automatically deploying, scaling, and managing many containers in a cluster environment. Kubernetes handles this work efficiently.

- **Cluster**: In Kubernetes, a cluster is a set of nodes that run containers. It's typically made up of one or more master nodes and several worker nodes.

- **Pod**: The smallest deployment unit in Kubernetes, which can contain one or more containers. Containers in the same pod share network and storage resources.

- **Service**: Because pods can be dynamically created and deleted, services are used to manage the network paths of pods. A service provides a single IP address and DNS name for a set of pods.

- **Deployment**: A configuration that declares the desired state of an application. Kubernetes uses deployments to manage pods, creating or deleting pods as needed.

The reasons for using Kubernetes are as follows.

- **Automated deployment and scaling**: Applications can be deployed and scaled automatically, reducing the operational burden.
- **Self-healing**: Automatically restarts containers that have problems, or moves containers to another node when a particular node has a problem.
- **Scalability**: It can manage a large number of containers effectively, enabling stable operation even in large-scale application environments.
- **Portability**: Containers can be managed the same way across various cloud providers and on-premises environments.

Simply put, Kubernetes is a powerful tool that lets you efficiently manage and deploy many containers. If Docker focuses on running individual containers, Kubernetes focuses on orchestrating those containers so they work smoothly in large-scale environments.

### ✅ Differences between Docker and Kubernetes

Docker and Kubernetes are both container-related technologies, but they have different purposes and complement each other. The features Docker provides alone may not be enough to reliably operate a large-scale application, and using Kubernetes in addition gives you the following benefits.

**1. Container orchestration:**
- **Docker**: Docker is a tool for creating, running, and managing individual containers. But it has limits when it comes to managing many containers.
- **Kubernetes**: An orchestration tool that can efficiently deploy, scale, and manage dozens to thousands of containers. Kubernetes manages the complexity of applications and helps many containers interact and work together.

**2. Automation:**
- **Docker**: Running containers has to be done manually, and if a failure occurs, recovery has to be done manually.
- **Kubernetes**: Automates the process of deploying, updating, and recovering containers. It automatically restarts containers that have problems, or moves containers to another node if a particular node has a problem.

**3. Scaling:**
- **Docker**: Scaling individual containers is possible, but scaling multiple containers manually is inefficient.
- **Kubernetes**: Can automatically scale containers (scale up/down) according to traffic or load. For example, if server load increases due to a sudden surge in users, Kubernetes automatically creates more containers to distribute the load. (Auto Scaling, Manual Scaling, Cluster Autoscaler)

**4. Self-healing:**
- **Docker**: If a container fails, you have to respond manually.
- **Kubernetes**: If a container fails, Kubernetes automatically restarts it, or runs a replacement container if needed, to maintain system availability. (Liveness Probe, Readiness Probe for health checks)

**5. Service discovery and load balancing:**
- **Docker**: By default, network connections between containers require manual setup, and load balancing also has to be configured yourself.
- **Kubernetes**: Automatically manages service discovery (automatic network connections between containers) and load balancing. This makes communication and traffic distribution between multiple containers efficient.

**6. Managing complex applications:**
- **Docker**: Excellent at managing individual containers, but limited for managing complex microservice architectures.
- **Kubernetes**: Can effectively manage complex applications made up of multiple containers, making it easier to implement and maintain a microservice architecture.

Docker is the core of container technology and is powerful for packaging and running individual applications as containers. However, for managing and automating many containers in large, complex systems, a container orchestration tool like Kubernetes is essential. With Kubernetes, you can reduce operational complexity and build systems with higher stability, availability, and scalability.

## 🐳 In-house Docker Hub

To deploy, test, and operate an application in a cluster's containers, you need a Docker image.

You can build an image yourself and register it in a repository to use, or you can pull a public image.

The company the author works at runs its own Docker Hub service internally. This service is an image registry that supports image storage, authentication/permission management for images per organization, automatic builds and deployment, and more.

- Automatic builds: automatically builds when a GitHub event occurs on a specific branch / tag
- Deploy from the in-house K8S orchestration tool: when an image with a specific tag is pushed, automatically deploys the configured yaml file

Using this, we were able to automate building/deploying the service's Docker image.

## 🚢 In-house Kubernetes Cluster Orchestration

The company the author works at runs a Kubernetes-based Cluster Orchestration service internally.

The service lets you create the 3 kinds of nodes below.
- **Master node**: Manages the cluster.
- **Worker node**: Where pods run.
- **Ingress node**: Acts as a load balancer when accessing pods inside the cluster from outside the cluster. Uses NGINX as the ingress controller.


## Build/Deploy Flow

![Infrastructure diagram](/images/web_setting-infra_01.png)

### 1. Automatic builds (with Docker Hub)

- Dockerfile: A file that defines the application's environment and how to run it. The application's image is built based on the Dockerfile.

- GitHub: The repository where the source code is managed, set up to detect changes on specific branches or tags and automatically build the image.

- Webhook: When a specific event (e.g. a code push) occurs on GitHub, it sends a notification to Docker Hub to trigger an image build.

- Docker Hub: Builds the image based on the Dockerfile and stores this image in the repository. This stored image can be used in the Kubernetes cluster.

### 2. Automatic deployment (with K8S)

- **Kubernetes cluster**: An environment that deploys and runs containers on multiple nodes within the cluster. It consists of master nodes, ingress nodes, and worker nodes.
    - **Master node**: Responsible for managing and controlling the cluster. Actual applications don't run here; it manages the state of the cluster.
    - **Ingress node**: Routes external traffic into the cluster. It forwards HTTP/HTTPS requests to the appropriate service through the ingress controller.
    - **Worker node**: The node where the actual application containers (Pods) run. Deployed applications run here.

- **Service**:
    - **Cluster IP**: Provides a fixed IP address for the service inside the cluster, so other pods in the cluster can access this service.
    - **Load balancer (VIP)**: When accessing the service from outside, traffic is distributed via the load balancer using a VIP (virtual IP).

- **Ingress**: Manages HTTP/HTTPS traffic and forwards requests to the appropriate service. In this process, the ingress.yaml file is used to define the configuration.

- **Deployment**: The application's deployment configuration is defined through the prod.yaml file. Based on this file, Pods are created and run on worker nodes.

### 3. Configuration files

- **prod.yaml**: The Kubernetes deployment configuration file used when deploying to the actual production environment. This file is used to define the desired number of pods, container image, environment variables, and so on.

- **service.yaml**: The service configuration file, which defines the service type (e.g. ClusterIP, NodePort, LoadBalancer) and the ports and related information the service provides.

- **ingress.yaml**: A file that defines ingress resources, setting the rules for routing external traffic to internal services.

- **ingress-node-vip.yaml**: A file that defines the configuration for routing traffic to specific nodes using a VIP.

### Explanation of the yaml for deployment

**1. `deploy/prod.yaml`**

Specifies how to run the server in the cluster. Through this, you can deploy the application (run it on the cluster's worker nodes).

- The path of the image the container to run is based on,
- The spec for the controller that manages the pods on the worker nodes where the server runs,
- Environment variables,
- Specs for CPU and memory resources
- Criteria for checking whether the container is running properly (readinessProbe, livenessProbe)

You can create the deployment in the cluster with the commands below.

```zsh
# Apply the template contents to the cluster
kubectl apply -f prod.yaml

# Check the pod creation history
kubectl get deploy,rs,pod --show-labels

# Connect to a specific pod's logs
kubectl logs -f {파드 이름}
```

**2. `deploy/service.yaml`**

Specifies the spec for the service (controller).

- **Service**: Provides a single fixed endpoint. Corresponds to the controller on the master node. (Only valid within one worker node)
- **Pod**: The place where the actual Astro server runs within a worker node is called a pod. Because pods keep getting created and deleted, their IPs keep changing. So to set a fixed IP, you need to use a service. If you want to access a pod running the Astro server, you can access it via the fixed IP (cluster IP). (However, within the cluster, the service only distributes requests within one worker node.)

You can create the service in the cluster through kubectl (a CLI that provides an API for managing worker nodes' pods from the cluster's master node), as below.

```zsh
# Apply the template contents to the cluster
kubectl apply -f service.yaml

# Check the created service.
kubectl get service

# Look up resources by label.
kubectl get all -l app={앱 이름}
```

**3. `deploy/ingress.yaml`**

Specifies the spec for the ingress

- **Ingress**: A set of rules defining how to handle requests coming from outside the cluster into the cluster.
- **Ingress controller**: The node that actually makes the ingress work

To access the Astro server from outside the cluster, the service set up above alone isn't enough.
Since the service isn't exposed outside the cluster, it can't be accessed from outside.
So the ingress node connects to the service and helps external traffic reach the pods on the internal worker nodes.

Since the in-house Kubernetes orchestration service uses the nginx-based ingress-nginx controller, the ingress-nginx controller converts the ingress defined in ingress.yaml into nginx configuration and applies it.

You can create the ingress in the cluster with the commands below.

```zsh
# Apply the template contents to the cluster
kubectl apply -f ingress.yaml

# Check the created ingress
# You can access it directly from the browser via the ip in Address
kubectl get ingress
```

**4. `deploy/ingress-node-vip.yaml`**

Connects a load balancer VIP to the ingress nodes

- Load balancer: Helps control traffic, ensure availability, and improve performance for large-scale real services.
- In real services there are dozens of ingress nodes, so they're grouped under a load balancer to serve traffic.

You can complete the service infrastructure by creating a load balancer VIP that groups the ingress nodes.

```zsh
# Create the load balancer service
kubectl apply -f ingress-node-vip.yaml

# Look up services whose namespace is ingress-nginx.
# Ultimately, it can be accessed from outside via the External IP shown here.
kubectl get -n ingress-nginx service
```

## Connecting a domain

We created a domain using an in-house service that lets you create your own domain resources.

- Record type: A (a way of connecting an IPv4 address to a domain)
- Record value: The External IP obtained by connecting the load balancer VIP

