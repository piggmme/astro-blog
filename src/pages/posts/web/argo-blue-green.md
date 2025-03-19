---
title: 'ArgoCD Rollout로 Blue/Green 배포하기'
layout: ../_MarkdownPostLayout.astro
pubDate: 2025-3-19
description: 'ArgoCD Rollout로 Blue/Green 배포하기'
author: 'dev_hee'
image:
    url: ''
    alt: ''
tags: ["Web"]
---

## ArgoCD란?

ArgoCD는 쿠버네티스를 위한 선언적 GitOps CD(Continuous Delivery) 도구이다. GitOps란 Git 저장소에 있는 선언적 설정을 기반으로 인프라와 애플리케이션을 관리하는 방식이다.

### ArgoCD의 주요 특징

- 선언적 배포 (Declarative deployment):
    Git 리포지토리에 선언된 YAML 상태를 쿠버네티스 클러스터 상태와 일치시키도록 지속적으로 관리한다.

- 자동화된 동기화 (Automated Sync):
    Git 저장소의 변경을 자동으로 감지해 배포를 수행한다.

- 상태 시각화 (Visual dashboard):
    배포 상태를 UI를 통해 직관적으로 확인할 수 있다.

- 배포 이력 관리 (Deployment history):
    이전 배포 버전으로 손쉽게 롤백할 수 있는 기능도 지원한다.

## Blue/Green 배포란?

Blue/Green 배포는 무중단 배포 전략 중 하나로, 동일한 환경을 두 개 구성하여 버전을 교체하는 방식이다.
쿠버네티스는 기본적으로 Rolling 업데이트를 지원하며, 그 외의 다른 배포 전략을 사용하고 싶다면 ArgoCD의 추가 프로젝트인 Rollouts를 사용하면 가능하다.

### 동작 방식

1. **초기 상태**
   - Blue 환경: 현재 버전 (v1) 운영 중
   - Green 환경: 대기 상태

2. **새 버전 배포**
   - Green 환경에 새 버전 (v2) 배포
   - 이때 Blue 환경은 계속 운영됨

3. **테스트 및 전환**
   - Green 환경 테스트 진행
   - 문제가 없으면 트래픽을 Blue에서 Green으로 전환

4. **완료 후**
   - Green이 새로운 운영 환경이 됨
   - Blue는 롤백을 위해 대기 상태로 유지

### Blue/Green 배포의 장단점

**장점:**
- 무중단 배포 가능
- 빠른 롤백 가능 (트래픽만 다시 전환)
- 새 버전 사전 검증 가능

**단점:**
- 리소스가 두 배로 필요
- 데이터베이스 스키마 변경 시 복잡
- 전환 시점의 세션 관리 필요

## ArgoCD Rollout으로 Blue/Green 배포하기

ArgoCD는 Argo Rollouts라는 컨트롤러를 통해 Blue/Green 배포를 지원한다. Rollout 리소스를 통해 배포 전략을 정의하고 관리할 수 있다.

이미 기본 쿠버네티스 환경이 구성되어 있다면 3번부터 진행하면 된다.

### 1. Helm 설치

Helm은 쿠버네티스 패키지 매니저 역할을 한다.

```sh
# mac
brew install helm

# window
choco install kubernetes-helm
```

Helm이 정상적으로 설치되었는지 확인한다.
```sh
helm version
```

### 2. Helm 차트 생성하기

Helm 차트는 쿠버네티스 리소스를 관리하는 템플릿이다. 새 차트를 생성하기 위해 아래 명령어를 실행한다. 그 결과 `mychart/` 디렉토리가 생성되고 기본적인 템플릿이 포함되어 있다.

```sh
helm create mychart
```

```bash
mychart/
│── charts/        # 서브 차트 (의존성) 관리
│── templates/     # 쿠버네티스 리소스 템플릿 파일 (.yaml)
│── values.yaml    # 기본 설정 값
│── Chart.yaml     # 차트 메타데이터
│── README.md      # 설명 파일
```

- `Chart.yaml`: 차트의 이름, 버전, 설명 등을 포함하는 메타데이터 파일
- `values.yaml`: 기본 설정 값 (이 값을 수정하면 쉽게 배포 환경을 변경 가능)
- `templates/`: 쿠버네티스 배포를 위한 템플릿 YAML 파일들 (예: deployment.yaml, service.yaml 등)
- `charts/`: 서브 차트가 있는 경우 여기에 추가됨


### 3. `values.yaml` 수정

`values.yaml`은 Helm 차트에서 사용할 기본 값을 정의한다. 예를 들어, replicaCount, image 같은 설정을 변경할 수 있다.

만약 운영 환경과 테스트 환경에 따라 값들이 달라진다면 `values-prod.yaml`, `values-sandbox.yaml` 를 생성한 뒤 값을 추가해 주면 된다. 이 때, 두 환경에서 같은 값이 사용되는 경우는 `values.yaml`에 정의하면 된다.

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

### 4. Argo Rollouts 설치하기

쿠버네티스 환경에 아래처럼 Rollouts를 설치한다.
단 주의해야 할 점은 네임 스페이스(`argo-rollouts`)를 변경하면 안된다.

```sh
kubectl create namespace argo-rollouts

kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml
```

Argo Rollouts CLI 를 설치하면 더 쉽게 모니터링할 수 있다.

```sh
brew install argo-rollouts
```

아래 명령어로 파드가 잘 실행되었는지 확인한다.

```sh
kubectl get pods -n argo-rollouts
```

### 5. `rollout.yaml` 생성하기

> ⚠️ 주의: rollout은 쿠버네티스 기본 구성인 deployment 를 대신해서 파드를 제어하기 때문에, 만약 기존 구성에 deployment가 있었다면 거기에 작성된 spec을 rollout.yaml로 옮겨 적은 뒤 파일을 제거해야 한다.

기본 구성에서 `my-app`을 프로젝트 이름으로 변경하면 된다.

- 참고: 여기서는 설명의 편의를 위해서 값들을 직접 템플릿에 작성했는데, `values.yaml` 를 사용해서 따로 관리해주는 것이 좋다.

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
      autoPromotionEnabled: true  # 배포 이후 자동 전환 여부 (수동 전환하고 싶으면 false)
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:v1  # 이미지 버전
        ports:
        - containerPort: 80
```

### 6. `service.yaml` 구성하기

Argo Rollouts는 트래픽을 두 개의 서비스로 관리한다.

- 현재 운영 중인 서비스
- 새로 배포할 서비스

Blue/Green 배포를 진행하게 되면 새로 배포할 서비스에 연결된 파드들이 생성되고, 파드가 모두 생성되고 나면 한번에 트래픽이 현재 운영 중인 서비스에서 새로 배포할 서비스로 이동하게 된다.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-service # 현재 운영 중인 서비스
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
  name: my-app-preview-service # 새로 배포할 서비스
spec:
  selector:
    app: my-app
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

### 7. 새로운 버전 배포하기

`rollout.yaml` 에서 이미지 버전을 변경한 뒤 변경사항을 적용하면 새로운 버전으로 배포 된다.

```yaml
# rollout.yaml
spec:
  template:
    spec:
      containers:
      - name: my-app
        image: my-app:v2  # v1 → v2로 변경
```


## 트러블 슈팅

### Blue/Green 배포시 과도하게 파드가 많이 생성됨

새로운 버전을 배포할 때 파드가 과도하게 많이 생성되는 현상이 발생하였다.

```yaml
# rollout.yaml
  strategy:
    blueGreen:
      activeService: my-app-service
      previewService: my-app-preview-service
      autoPromotionEnabled: true
      scaleDownDelaySeconds: 30 # 이전 버전(old version)을 종료하기 전까지 30초 대기
```

`scaleDownDelaySeconds` 파라미터를 추가해서 해결할 수 있었다.

`scaleDownDelaySeconds` 파라미터는
- Blue/Green 배포가 성공적으로 완료된 후
- 이전 버전(old version)을 종료하기 전까지 대기하는 시간을 초 단위로 지정
- 여기서는 30초로 설정

이 지연 시간(delay)이 필요한 이유는

1. 새 버전으로 전환 후 문제가 발생했을 때 빠른 롤백을 위해
2. 진행 중인 요청들이 안전하게 완료될 수 있도록 하기 위해

예를 들어:
- 새 버전(Green)으로 전환 완료
- 30초 동안 이전 버전(Blue) 유지
- 30초 후 이전 버전 종료

### `hpa.yaml` 적용

ArgoCD Rollouts를 적용하기 이전에 `HPA`가 적용되어 있었는데,
rollouts을 적용하면서 `HPA`가 정상적으로 동작하지 않았다.

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: argoproj.io/v1alpha1  # ✅ Rollout을 대상으로 변경
    kind: Rollout  # ✅ Deployment → Rollout 변경
    name: my-app-rollout  # ✅ 실제 Rollout 이름과 동일하게 설정
```

위와 같이 `Deployment` 대신에 새로 생성한 `Rollout`을 적용하면 `HPA`가 정상적으로 동작하는 것을 확인할 수 있다.

### 배포 성공/실패시 알림 보내기

ArgoCD의 Hook을 사용한 배포 성공/실패 알림 Job을 정의할 수있다.

- 참고: https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/#using-a-hook-to-send-a-slack-message

```yaml
# 배포 성공
apiVersion: batch/v1
kind: Job
metadata:
  generateName: notification-success- # 이름은 원하는 대로 수정 가능
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: notification-success # 이름은 원하는 대로 수정 가능
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
# 배포 실패
apiVersion: batch/v1
kind: Job
metadata:
  generateName: notification-fail- # 이름은 원하는 대로 수정 가능
  annotations:
    argocd.argoproj.io/hook: SyncFail
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: notification-fail # 이름은 원하는 대로 수정 가능
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