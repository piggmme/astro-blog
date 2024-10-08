---
title: 'Web Vitals | Interaction to Next Paint (INP) 번역'
layout: ../_MarkdownPostLayout.astro
pubDate: 2022-12-13
description: '본 문은 Jeremy Wagner가 작성한 Interaction to Next Paint (INP) 을 번역한 글입니다.'
author: 'dev_hee'
image:
    url: 'https://velog.velcdn.com/images/heelieben/post/d30f763c-7f67-4421-81c9-14b2f684bb9d/image.png'
    alt: ''
tags: ["Web"]

---

> 본 문은 Jeremy Wagner가 작성한 [Interaction to Next Paint (INP)](https://web.dev/inp/) 을 번역한 글입니다.

## INP (Interaction to Next Paint)

![](https://velog.velcdn.com/images/heelieben/post/d30f763c-7f67-4421-81c9-14b2f684bb9d/image.png)

INP(Interaction to Next Paint)는 [응답성](https://web.dev/user-centric-performance-metrics/#types-of-metrics)을 평가하는 실험적 메트릭입니다. 페이지와의 상호작용으로 인해 페이지가 응답하지 않는 경우엔 사용자 경험이 좋지 않습니다. INP는 사용자가 페이지에서 수행한 모든 상호 작용의 대기 시간을 관측하고, 거의 모든 상호 작용이 있었던 값을 종합하여 하나의 단일 값으로 보고합니다. **INP가 낮다는 것은 페이지가 모든 또는 대부분의 사용자 상호 작용에 지속적으로 빠르게 응답할 수 있음을 의미합니다.**

Chrome 사용 데이터에 따르면 페이지에서 **사용자 시간의 90%는 페이지가 로드된 후** 소비됩니다. 따라서 페이지 라이프사이클 전체중에서 응답성을 신중하게 측정하는 것이 중요합니다. 이것이 INP 메트릭이 평가하고자 하는 바 입니다.

반응성이 좋다는 것은 페이지가 **상호작용에 빠르게 반응**한다는 것을 의미합니다. 페이지가 상호작용에 응답한다는 것은 브라우저가 다음 프레임을 렌더링하는 **시각적 피드백** 입니다. 시각적 피드백은 예를 들어 온라인 장바구니에 추가한 항목이 실제로 추가되고 있는지, 모바일 탐색 메뉴가 열렸는지, 로그인 양식의 내용이 서버에서 인증되고 있는지 등을 알려줍니다.

어떤 상호작용은 자연스럽게 다른 것보다 오래 걸릴 수 있습니다. 특히 복잡한 상호작용의 경우, **사용자에게 어떤 일이 일어나고 있다는 신호**로 일부 **초기 시각적 피드백**을 신속하게 보여주는 것이 중요합니다. 다음 페인트까지의 시간이 초기 시각적 피드백을 보여주기에 적합한 시점입니다. 따라서 INP의 목적은 상호 작용의 모든 최종 효과(예: 다른 비동기 작업의 네트워크 가져오기 및 UI 업데이트)를 측정하는 것이 아니라, **다음 페인트가 차단되는 시간**을 측정하는 것입니다. **시각적 피드백을 지연하면 페이지가 사용자의 작업에 응답하지 않는다는 인상을 사용자에게 줄 수 있습니다.**

INP의 목표는 사용자가 수행하는 대부분의 상호 작용에 대해 **사용자가 상호 작용을 시작한 때부터 다음 프레임이 그려질 때까지의 시간 간격을 가능한 한 짧게 줄이는 것**입니다.

다음 영상에서 오른쪽의 예는 **아코디언이 열리는 즉각적인 시각적 피드백**을 제공합니다. 응답성이 좋지 않으면 사용자 경험이 좋지 않으므로 입력에 대한 여러 개의 의도하지 않은 응답이 발생할 수 있음을 보여줍니다.

![](https://velog.velcdn.com/images/heelieben/post/b10f5a4c-a032-4970-aa3e-daa0caad91e8/image.gif)

나쁜 경우과 좋은 경우의 예시입니다.
왼쪽에는 긴 작업으로 인해 아코디언이 열리지 않습니다. 이로 인해 사용자는 사용자 경험이 좋지않다고 생각하면서 여러 번 클릭하게 됩니다. 기본 스레드가 따라잡으면 지연된 입력을 처리하여 아코디언이 예기치 않게 열리고 닫힙니다.

## INP란 무엇일까?

INP는 페이지에서 발생하는 모든 클릭과 탭 및 키보드 상호 작용을 측정하여 **페이지의 전반적인 반응성을 나타내는 것**을 목표로 합니다. 사용자가 페이지 작업을 완료하면 관찰된 상호작용 중 가장 긴 상호작용(아래에 언급된 일부 예외 포함)이 페이지의 INP 값으로 선택됩니다.

### 상호 작용 (Interaction)

**상호 작용**은 동일한 논리적 사용자 제스처로 인해 호출되는 **이벤트 핸들러 그룹**입니다. 예를 들어 터치스크린 장치의 "tap" 상호 작용에는 `pointerup`, `pointerdown`, `click` 과 같은 여러 이벤트가 포함됩니다. 상호 작용은 JavaScript, CSS, 기본 제공 브라우저 컨트롤(예: `form` elements) 또는 이들의 조합에 의해 구동될 수 있습니다.

**상호 작용의 대기 시간**은 사용자가 상호 작용을 시작한 시간부터 시각적 피드백과 함께 다음 프레임이 제시되는 순간까지 상호 작용을 구동하는 이벤트 핸들러 그룹의 가장 긴 단일 기간 으로 구성됩니다.

> INP 측정 방법에 대한 자세한 내용은 "상호 작용에는 무엇이 있습니까?" 부분을 참고하세요.

## 좋은 INP 값은 무엇일까?

응답성 측정 수치에 "좋음" 또는 "나쁨"과 같은 기준을 고정하는 것은 어렵습니다. 한편으로는 우수한 응답성을 우선시하는 개발 문화를 장려하고 싶을 것입니다. 반면에 달성 가능한 개발 기대치를 정하기 위해, 사람들이 사용하는 기기들의 상당한 성능 차이가 있다는 사실을 고려해야 합니다.

응답성이 뛰어난 사용자 경험을 제공하기 위해, 측정할 수 있는 좋은 임계값은 실제 서비스에서 기록된 페이지 로드의 75번째 백분위수이며, 이는 모바일 및 데스크탑 장치에서 세분화 됩니다.

- 200밀리초 이하의 INP는 페이지의 응답성이 우수함
- 200밀리초 초과 ~ 500밀리초 미만의 INP는 페이지의 응답성을 개선해야 함
- INP가 500밀리초를 초과하면 페이지의 응답성이 낮음.

> INP는 아직 실험 단계로 임계값에 대한 지침은 미세하게 조정되면서 시간이 지남에 따라 변경될 수 있습니다. 이 문서의 끝에 있는 [CHANGELOG](https://web.dev/inp/#changelog)는 모든 변경 사항을 반영하도록 업데이트됩니다.

## 상호 작용(Interaction) 이란?

![](https://velog.velcdn.com/images/heelieben/post/e7e226ed-48c0-4605-bd03-5ef08ff5a145/image.svg)

위의 그림은 상호 작용에 대해 잘 나타나 있습니다.
`input delay` 는 이벤트 핸들러가 실행되기 시작할 때까지 발생하며, 이는 메인 스레드가 긴 작업을 수행하고 있을때 길어질 수 있습니다. 후에 `processing time`동안 이벤트 핸들러가 호출되며, `presentation delay` 동안 다음 프레임이 표시되기 전 까지 딜레이가 발생합니다.

상호 작용의 주요 유발자는 종종 JavaScript이지만, 체크박스나 라디오 버튼 및 CSS에 의해 제어되는 경우처럼 JavaScript로 구동되지 않더라도 상호 작용을 유발할 수 있습니다.

INP는 다음과 같은 상호 작용 유형만 관찰합니다.

- 마우스로 클릭
- 터치스크린으로 기기를 탭
- 실제 또는 가상 키보드에서 키 누르기

> 마우스 hover 및 스크롤은 INP에 영향을 주지 않습니다. 그러나 키보드를 사용한 스크롤(스페이스 바, 페이지 위로, 페이지 아래로 등)에는 INP가 측정 하는 다른 이벤트를 트리거할 수 있는 키 입력이 포함될 수 있습니다. 그에 대한 결과로 발생한 스크롤은 INP 계산 방법에 포함되지 않습니다.

상호 작용은 여러 이벤트로 구성된 두 개의 부분으로 구성될 수 있습니다.
예를 들어 키 입력은 `keydown`, `keypress`, `keyup` 이벤트로 구성됩니다.
탭 상호작용은 `pointerup`, `pointerdown` 이벤트로 구성됩니다.
상호작용 내에서 **가장 긴 지속시간을 가진 이벤트**가 **상호 작용의 대기시간**이 됩니다.

![](https://velog.velcdn.com/images/heelieben/post/d68ec2e0-88a9-4ea8-a646-175fcb6674eb/image.svg)

위 그림은 여러 이벤트 핸들러와 상호작용에 대해 설명되어 있습니다.
상호 작용의 첫번째 부분(`mousedown`)에선 사용자가 버튼을 클릭할때 입력을 받습니다. 하지만 마우스 버튼을 놓기 전에 프레임이 표시됩니다. 사용자가 마우스 버튼을 놓으면 다음 프레임이 표시되기 전에 다른 일련의 이벤트 핸들러(`pointup`, `click`)가 실행되어야 합니다.

INP는 사용자가 페이지를 떠날 때 계산되어 전체 페이지 수명 주기 동안 페이지의 전반적인 응답성을 나타내는 단일 값이 됩니다. **INP가 낮다는 것은 페이지가 사용자 입력에 안정적으로 반응한다는 것을 의미합니다.**

## INP와 FID(First Input Delay)의 차이점

INP는 모든 페이지 상호 작용을 고려하지만 FID(First Input Delay)는 첫 번째 상호 작용만 고려합니다. 또한 FID는 첫 번째 상호작용의 입력 지연만 측정하며, 이벤트 핸들러를 실행하는 데 걸리는 시간이나 다음 프레임 표시 지연은 측정하지 않습니다.

FID에서는 로드 단계에서 페이지와 이루어진 첫 번째 상호작용에서 입력 지연이 거의 없다면 페이지가 좋은 첫인상을 남겼다는 의미입니다.

INP는 첫인상 그 이상입니다. 모든 상호 작용을 샘플링하여 반응성을 종합적으로 평가할 수 있으므로 **INP가 FID보다 전반적인 반응성에 대한 더 신뢰할 수 있는 지표**가 됩니다.

## INP값이 보고되지 않는 경우는?

페이지가 INP 값을 반환하지 않을 수 있습니다. 이는 아래와 같은 이유로 발생할 수 있습니다.

- 페이지가 로드되었지만 사용자가 키보드의 키를 클릭하거나 탭하거나 누르지 않았습니다.
- 페이지가 로드되었지만 사용자가 클릭, 탭 또는 키보드 사용이 포함되지 않은 제스처를 사용하여 페이지와 상호 작용했습니다. 예를 들어 요소 위로 스크롤하거나 hover하는 경우엔 INP가 계산되지 않습니다.
- 페이지와 상호작용하도록 스크립팅되지 않은 검색 크롤러 또는 헤드리스 브라우저와 같은 봇이 페이지에 액세스하고 있습니다.

## INP 측정 방법

NP는 다양한 도구를 통해 [현장(실 사용자) 또는 실험 환경(light house 등)](https://web.dev/lab-and-field-data-differences)에서 모두 측정할 수 있습니다.

> 웹사이트의 INP를 측정하는 가장 좋은 방법은 현장의 실제 사용자로부터 메트릭을 수집하는 것입니다. 성능 평가를 위해 실험실 데이터에 의존하는 데 익숙하다면 시간을 내어 [실험실 데이터와 현장 데이터가 다를 수 있는 이유(및 이에 대해 수행할 작업)](https://web.dev/lab-and-field-data-differences)를 읽어보세요 .

### 현장에서 측정 도구

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Chrome User Experience Report (CrUX)](https://developer.chrome.com/docs/crux/)
- [web-vitals JavaScript library](https://github.com/GoogleChrome/web-vitals)

```js
// web-vitals JavaScript library
import {onINP} from 'web-vitals';

onINP(({value}) => {
  // Log the value to the console, or send it to your analytics provider.
  console.log(value);
});
```

### 실험실 측정 도구

- Lighthouse Panel in DevTools, available in "Timespan Mode".
- [Lighthouse npm module](https://www.npmjs.com/package/lighthouse).
- [Lighthouse User Flows](https://web.dev/lighthouse-user-flows/)
- [Web Vitals extension for Chrome](https://chrome.google.com/webstore/detail/web-vitals/ahfhijdlegdabablpippeagghigmibma)


## INP 개선 방법

[INP 최적화에 대한 전체 가이드](https://web.dev/optimize-inp/)는 현장 에서 느린 상호 작용을 식별하고 실험실 데이터를 사용하여 이를 드릴다운하고 최적화하는 프로세스를 안내합니다.

---

### 글을 읽으며...

실무에서 사용자가 상태값을 변경하는 토글 버튼을 클릭했을 때,
서버에서 응답이 도착했을 때 토글이 on/off 되도록 작업을 진행했다.
그렇게 하니 사용자 경험이 매우 안좋아져서, 서버 응답이 도착하기 전에 미리 토글 버튼의 상태를 on/off 하였더니, 서버에서 정상적으로 작업이 완료 되기 전에 사용자가 상호작용을 시도하여 버그가 유발될 수 있는 UX가 되었다.

그래서 최선으로는 토글 버튼 상태를 변경하여 시각적 피드백이 즉각적으로 발생하고, 더이상의 상호작용을 방지하기 위해 버튼을 `disable` 하고, 로딩 스피너를 보여주어 작업이 진행중임을 나타내었다. 후에 토스트 메시지로 작업을 정상적으로 완료했다고 알림을 노출했다.

이런 작업을 수행하면서, 실제 사용자가 경험하는 UX를 개선할 수 있는 방법이 무엇이 있을까 고민하게 되었는데, 새롭게 나온 `INP` 를 알게되어 고민에 대한 해답을 얻은 것 같았다.

토글 버튼을 작업하며 사실은 loding 상태가 보여지는 토글 버튼 디자인이 있으면 좋겠다 싶어서 찾아보니 다음과 같은 자료도 찾을 수 있었따.

!youtube[0ZXkFKlS47I]

실무에서는 디자인 시스템이 이미 정해져있어서 로딩 상태를 보여주는 토글 버튼을 적용하진 않았지만, 사용자 경험에 대해서 한번 더 고민해 볼 수 있는 시간이었다.
