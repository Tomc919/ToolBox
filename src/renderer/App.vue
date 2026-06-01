<template>
  <div class="app-shell" :class="{ standalone: isStandalone }">
    <template v-if="!isStandalone">
      <aside class="app-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }" :style="{ width: appStore.sidebarCollapsed ? '68px' : '240px' }">
        <div class="sidebar-drag">
          <div class="traffic-lights">
            <button class="tl-btn tl-close" @click="win.close()" title="关闭" />
            <button class="tl-btn tl-min" @click="win.minimize()" title="最小化" />
            <button class="tl-btn tl-max" @click="win.maximize()" title="最大化" />
          </div>
        </div>
        <AppSidebar />
      </aside>
      <div class="app-body">
        <header class="app-topbar">
          <AppHeader />
        </header>
        <main class="app-content">
          <router-view />
        </main>
      </div>
    </template>
    <template v-else>
      <main class="app-content">
        <router-view />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()
const win = window.electronAPI.window

const isStandalone = computed(() => route.query.standalone === '1')
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #1c1c1e;
  border-radius: 12px;
  border: 0.5px solid rgba(255,255,255,0.06);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.24), 0 0 0 3px rgba(0,0,0,0.06);
  contain: paint;
}

/* --- Traffic light window controls (macOS style) --- */
.traffic-lights {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}
.tl-btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: filter 0.15s ease;
  padding: 0;
}
.tl-btn:hover { filter: brightness(0.85); }
.tl-btn:active { filter: brightness(0.70); }
.tl-close { background: #ff5f57; }
.tl-min   { background: #febc2e; }
.tl-max   { background: #28c840; }

/* --- Sidebar --- */
.app-sidebar {
  flex-shrink: 0;
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sidebar-drag {
  height: 42px;
  flex-shrink: 0;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  padding: 0 14px;
}

/* --- Content body --- */
.app-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  background: var(--apple-bg);
}
.app-topbar {
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: rgba(242,242,247,0.94);
  border-bottom: 0.5px solid rgba(0,0,0,0.06);
}
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  background: transparent;
}

/* --- Standalone window (document viewer) --- */
.app-shell.standalone {
  border-radius: 0;
  border: none;
  box-shadow: none;
  background: var(--apple-bg);
}
.app-shell.standalone .app-content {
  padding: 0;
}
</style>
