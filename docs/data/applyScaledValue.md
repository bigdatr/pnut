---
title: applyScaledValue
---

Because primitive dimensions correlate to an onScreen pixel value the need
a slightly different calculation when applying the scale. This is abstracted away
to save the headache of knowing to recaclulate.

```flow
(
	dimensionName: string,
	scale: Scale,
	value: any
	props: Object
) => any
```

