---
title: '실시간 동시 편집: OT와 CRDT'
pubDate: 2023-1-1
description: '실시간 동시 편집: OT와 CRDT에 대해 알아보자.'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/5adcc6e6-9cdb-4ea8-8e18-918a19259f21/image.png'
    alt: ''
tags: ["FrontEnd"]

---

## 실시간 동시 편집

Google Docs나 Figma, VSCode 의 LiveShare 등은 온라인에서 하나의 문서를 동시에 편집할 수 있고, 실시간으로 여러 유저의 편집 내용이 각자 편집 화면에 바로 반영됩니다. 이렇듯 실시간 동시 편집 기술을 제공하는 여러 서비스들이 많아지고 있습니다.

하지만 동시 편집은 인간의 눈엔 직관적인 것과 다르게, 구현상에서는 분산된 환경에서의 동시성은 복잡한 문제를 가지고 있으며, 그런 모호함을 해결하기 위한 여러 기술들이 대두되고 있습니다.

## OT (Operational Transformation)

OT는 입력한 순서에 따라 서버가 이를 적절히 변형하여 전달하는 방식입니다. OT 는 시간상의 순서를 고려해 우선 순위를 부여하고, 앞에서 적용할 변경사항이 다음 순위의 변경사항을 보정하는 정보로 사용됩니다.

유저1이 맨 앞에 'C'를 입력한 변경사항과 유저2의 첫 문자 삭제 변겨사항을 서버가 각각 수집합니다. 이후 변경사항이 생긴 시간에 맞춰 정렬합니다. 'C' 문자 삽입이 시간적으로 앞서 발생한 변경사항이라면, 'C' 문자 입력으로 인해 이후 문자들의 인덱스가 1씩 뒤로 밀리게 됩니다. 결과적으로 **첫 번째 문자 삭제 변경사항은 두 번째 문자 삭제로 인덱스가 보정되어 전달**됩니다.

![](https://velog.velcdn.com/images/heelieben/post/5adcc6e6-9cdb-4ea8-8e18-918a19259f21/image.png)


만약 유저1과 유저2이 똑같은 위치의 문자를 삭제한 경우에 보정 결과는 변경사항 없음으로 전달됩니다.

![](https://velog.velcdn.com/images/heelieben/post/b439bc2b-d06d-47fc-9883-dd8b1a227f0f/image.png)


OT방식은 꽤 직관적이여서 초기의 동시 편집 기능 도입때 많이 사용되었습니다. 아직도 Google Docs나 Microsoft Office가 OT 방식을 사용하고 있습니다.

하지만 OT 방식의 가장 큰 문제점은 중앙 집중 처리 방식입니다. 즉 중앙에서 변경사항을 보정해줄 서버가 필요합니다. 이는 트래픽이 몰렸을 때 서버에 과부하가 올 수 있다는 단점이 존재합니다. 이는 비용 측면에서도 좋지 않으며, 사용자 입장에서도 서버 연산 후 응답을 받는 시간이 필요하므로 사용성이 떨어집니다.

## CRDT (Conflict free Replicated Data Types)

동시 편집 기술 초기에는 OT가 주류였으나, 현재에는 CRDT 방식이 인기를 얻고 있습니다. CRDT의 장점은 중앙 서버가 필요 없고, 문서를 편집하는 유저들끼리만 데이터를 교환하면 되므로 속도가 빠르고 서버의 부하를 줄이는 효과가 있었습니다.

OT는 **편집 시간과 인덱스**를 기반으로 변경사항을 보정하는 것과 다르가, CRDT는 스트림 상의 **각 문자에 고유한 id**를 부여하고, 이를 기반으로 보정을 정의한다는 차이점이 있습니다.

CRDT는 변경사항을 보정할 필요 없이 바로 다른 유저의 문서에 적용됩니다. 시간 순서에 대한 우선순위 없이 정확한 위치에 해당 문자를 삽입할 수 있습니다. 유저1이 'C'를 추가하는 경우, 새로운 아이디를 부여하고 문자를 id가 1인 문자의 위치에 추가합니다. 그리고 유저2의 환경에서 변경사항을 받아 적용할 수 있습니다. 유저2가 id가 1인 문자를 삭제하는 변경도 마찬가지로 유저1에서 변경사항을 적용할 수 있게됩니다.


![](https://velog.velcdn.com/images/heelieben/post/6ef70f97-d710-4b3a-9244-f2ea2db2fb40/image.png)

유저1과 유저2가 동일한 위치의 문자를 삭제하더라도 인덱스가 아닌 id를 기반으로 하기에 이미 삭제된 id는 존재하지 않아서 중복 삭제도 문제가 되지 않습니다.


![](https://velog.velcdn.com/images/heelieben/post/2c58ff6e-383d-4294-924f-635a27358217/image.png)


이런 CRDT에서도 OT와 비교한 단점이 존재합니다.

1. OT보다 많은 메모리를 사용합니다. 고유 id 값을 저장하는 메모리와 이를 트리구조로 관리하기 위한 메모리를 필요로 하기 때문에, 일반적인 문서보다 2~3배 더 큰 메모리를 사용합니다.

2. Peer-to-Peer 통신이 항상 가능하지는 않습니다.  

3. CRDT가 시간을 기반으로 하는것이 아닌 id를 기반으로 하기 때문에, 실시간성이 모호해지고 동기화 결과 문자열이 섞여 의도하지 않은 결과물이 나올 수 있습니다. 

하지만 이런 단점들도 현재에는 여러 기술들이 나오면서 개선되고 있습니다. [참고 - I was wrong. CRDTs are the future](https://josephg.com/blog/crdts-are-the-future/)

- 속도 : 요즘의 CRDT (Automerge / RGA or y.js / YATA) 들은 log(n) 수준의 조회 가능합니다.
- 용량 : Martin 의 Columnar 인코딩은 문서 크기의 1.5~2배 크기 정도로 저장이 가능합니다.
- 기능 : 이론적으로는 Rewinding 및 replaying이 가능합니다.
- 복잡도 : 구현체 크기가 OT보다 CRDT가 크긴 하겠지만 큰 차이는 없습니다.

또한 CRDT만의 장점들 또한 명확하게 존재합니다.

1. 중앙 서버가 필요 없고 유저들 끼리 변경사항을 주고 받을 수 있어서 속도가 빠릅니다.
2. 오프라인 환경에서도 문서를 편집하고, 이후 온라인이 되었을때 변경사항 업로드가 가능합니다. 즉 네트워크에 구애를 받지 않습니다. (git 처럼 사용 가능)

## OT, CRDT 라이브러리

OT, CRDT 를 직접 구현하는 것은 매우 번거로운 일입니다.
이미 잘 만들어져있는 여러 라이브러리들이 있고, 목적에 맞게 잘 선택해서 사용하면 됩니다.

### OT

- Ot : https://github.com/Operational-Transformation/ot.js
- Gulf : https://github.com/gulf/gulf#readme


### CRDT

- Automerge : https://automerge.org/

Automerge는 CRDT 기반으로 네트워크에서 자유롭고, 클라이언트 서버, Peer-to-peer, 로컬 환경에서 자유롭게 사용 가능합니다. 자바스크립트와 Rust 로 만들어졌으며 여러 플랫폼에서 사용가능해 호환성이 좋습니다.

- Yjs : https://docs.yjs.dev/

Yjs또한 CRDT 기반으로 만들어져있으며 document가 잘 작성되어있고 직관적입니다. npm trends에서 가장 많은 다운로드수를 보여줍니다. 따라서 [yjs-demo](https://github.com/yjs/yjs-demos) 와 같은 참고할 예제들이 많습니다. 
Yjs 는 텍스트에 대한 공유 편집을 위해 탄생했기 때문에, [Quill](https://docs.yjs.dev/ecosystem/editor-bindings/quill), [TipTap](https://docs.yjs.dev/ecosystem/editor-bindings/tiptap2) 과 같은 텍스트 에디팅 라이브러리와의 호환성이 매우 좋습니다. 그리고 [y-presence](https://github.com/nimeshnayaju/y-presence), [y-websocket](https://github.com/yjs/y-websocket) 와 같은 다양한 연관 라이브러리들이 많습니다.





> 참고
> - https://velog.io/@parksil0/OT와-CRDT
> - https://s-core.co.kr/insight/view/새로운-업무환경의-대두-동시-편집-기술/
> - https://news.hada.io/topic?id=2962