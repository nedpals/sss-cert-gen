<template>
  <canvas ref="canvas"></canvas>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { bezierSkin } from '../utils/blob';

const HALF_PI = Math.PI / 2;
const bumpRadius = 100;
const halfBumpRadius = bumpRadius / 2;

const emit = defineEmits(['fill']);
const props = defineProps({
  scaleX: {
    type: Number,
    default: 1
  },
  scaleY: {
    type: Number,
    default: 1
  },
  translateX: {
    type: Number,
    default: 0
  },
  translateY: {
    type: Number,
    default: 0
  },
  radius: {
    type: Number,
    default: 500
  },
  segments: {
    type: Number,
    default: 8
  }
});

const step = HALF_PI / props.segments;
const canvas = ref<HTMLCanvasElement | null>(null);
const c = canvas.value?.getContext('2d');
const state = reactive({
  hasFill: false,

  wobbleIncrement: 0,
  anchors: [] as number[],
  radii: [] as number[],
  thetaOff: [] as number[],

  theta: 0,
  thetaRamp: 0,
  thetaRampDest: 12,
  rampDamp: 50,
});

function paint() {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
  }

  for (let i = 0; i < props.segments + 2; i++) {
    state.anchors.push(0, 0);
    state.radii.push(Math.random() * bumpRadius - halfBumpRadius);
    state.thetaOff.push(Math.random() * 2 * Math.PI);
  }

  // make background fill
  const bgCanvas = document.createElement('canvas');
  const bgCtx = bgCanvas.getContext('2d');
  emit('fill', bgCanvas, bgCtx, c);
  state.hasFill = true;
}

function loop() {
  if (!c || !canvas.value) return;

  c.clearRect(0, 0, canvas.value.width, canvas.value.height);
  update();
  window.requestAnimationFrame(loop);
}

function update() {
  if (!c || !canvas.value) return;

  state.thetaRamp += (state.thetaRampDest - state.thetaRamp) / state.rampDamp;
  state.theta += 0.03;

  state.anchors = [0, props.radius];
  for (let i = 0; i <= props.segments + 2; i++) {
    const sine = Math.sin(state.thetaOff[i] + state.theta + state.thetaRamp);
    const rad = props.radius + state.radii[i] * sine;
    const x = rad * Math.sin(step * i);
    const y = rad * Math.cos(step * i);
    state.anchors.push(x, y);
  }

  c.save();
  c.translate(props.translateX, props.translateY);
  c.scale(props.scaleX, props.scaleY);
  // c.scale(1, 1);
  c.beginPath();
  c.moveTo(0, 0);
  bezierSkin(c, state.anchors, false);

  if (!state.hasFill) {
    c.fillStyle = '#282a36';
  }

  c.lineTo(0, 0);
  c.fill();
  c.restore();
}

onMounted(() => {
  window.addEventListener('resize', paint);

  paint();
  loop();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', paint);
})
</script>
