<script setup lang="ts">
import { computed, type Ref, ref, onUnmounted, onMounted } from 'vue';
import './assets/app.css'
import { timeAgo } from './time-util'
import { useBrowserEvent } from 'browser-event-hook';

type HistoryItem = {
  title: string
  time: number
  id: string
  undo: Function
  redo: Function
}

const currentHistoryId: Ref<string> = ref('');
const history: Ref<HistoryItem[]> = ref([
  {
    title: 'Initial',
    time: Date.now(),
    id: Date.now().toString(),
    undo: () => { },
    redo: () => { },
  },
]);
const data: Ref<Record<string, any>> = ref({});
const view = computed(() => JSON.stringify(data.value, null, 2));
const add = () => {
  const time = Date.now();
  const id = time.toString();
  const key = Math.random().toString(36).substring(2, 5);
  const value = Math.random().toString(36).substring(2, 5);
  const title = `Add ${key}:${value}`;
  const undo = () => {
    delete data.value[key];
  };
  const redo = () => {
    data.value[key] = value;
  };
  data.value[key] = value;

  if (currentHistoryId.value !== history.value[history.value.length - 1].id && history.value.length > 1) {
    history.value = history.value.slice(0, history.value.findIndex((item) => item.id === currentHistoryId.value) + 1);
  }

  history.value.push({ title, time, id, undo, redo });
  redo();
  currentHistoryId.value = id.toString();
};
const restore = (id: string) => {
  const currentIndex = history.value.findIndex((item) => item.id === currentHistoryId.value);
  const targetIndex = history.value.findIndex((item) => item.id === id);
  const isBefore = currentIndex < targetIndex;
  const startIndex = isBefore ? currentIndex : targetIndex;
  const endIndex = isBefore ? targetIndex : currentIndex;
  const targetHistory = history.value.slice(startIndex, endIndex + 1);
  targetHistory.forEach((item) => {
    if (isBefore) {
      item.redo();
    } else {
      if (id === item.id) return;
      item.undo();
    }
  });
  currentHistoryId.value = id;
}
const { listen } = useBrowserEvent();
const { off } = listen(window, 'keydown', (event: any) => {

  if (event.metaKey && event.code === 'KeyZ') {
    const currentIndex = history.value.findIndex((item) => item.id === currentHistoryId.value);
    let targetHistory: HistoryItem | null = null;
    let targetIndex: number | null = null;
    if (!event.shiftKey) {
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) return;
      targetHistory = history.value[targetIndex];
    } else {
      targetIndex = currentIndex + 1;
      if (targetIndex > history.value.length - 1) return;
      targetHistory = history.value[targetIndex];
    }
    restore(targetHistory.id);
  }
});


onMounted(() => {

});

onUnmounted(() => {
  off();
});
</script>

<template>
  <ul class="layout">
    <li class="json-input">
      <h1>
        Action
      </h1>
      <div class="content">
        <div class="button">
          <button @click="add">Add history</button>
        </div>
        <div>
          <h1>버튼의 동작 설명</h1>
          <ul style="font-size: 13px;padding-left: 15px;">
            <li>랜덤한 키와 값으로 이루어진 객체 생성하는 함수 작성</li>
            <li>추가되는 객체를 삭제하는 함수 작성</li>
            <li>추가하는 함수를 Redo에 넣음</li>
            <li>삭제하는 함수를 Undo에 넣음</li>
            <li>히스토리 객체를 히스토리 배열에 추가함</li>
            <li>Redo 함수를 실행함</li>
          </ul>
        </div>
      </div>
    </li>
    <li class="history">
      <h1>History</h1>
      <div class="container">
        <ul class="list">
          <li v-for="item of history" :key="item.id" :class="currentHistoryId === item.id && 'active'"
            @click="restore(item.id)">
            <div>{{ item.title }}</div>
            <div>{{ timeAgo(item.time) }}</div>
          </li>
        </ul>
      </div>
    </li>
    <li>
      <h1>JSON output</h1>
      <textarea v-model="view" id="json-input" readonly placeholder="JSON output">
      </textarea>
    </li>
  </ul>
</template>
