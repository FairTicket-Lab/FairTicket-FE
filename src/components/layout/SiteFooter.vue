<script setup lang="ts">
</script>

<template>
  <footer class="border-t border-border bg-background">
    <div class="mx-auto max-w-7xl px-4 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- 브랜드 -->
        <div class="md:col-span-1">
          <div class="flex items-center gap-1.5 mb-3">
            <img src="/images/FairTicket logo.png" alt="FairTicket" class="h-24 w-auto" />
            <span class="font-display text-lg font-bold text-foreground">FairTicket</span>
          </div>
          <p class="text-sm text-muted-foreground leading-relaxed">
            공정한 티켓팅 플랫폼.<br />모든 팬에게 동등한 기회를.
          </p>
        </div>

        <!-- 링크 그룹 -->
        <div>
          <h4 class="text-sm font-semibold text-foreground mb-3">Events</h4>
          <ul class="space-y-2">
            <li>
              <RouterLink to="/concerts" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Concerts
              </RouterLink>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-foreground mb-3">Support</h4>
          <ul class="space-y-2">
            <li><span class="text-sm text-muted-foreground">FAQ</span></li>
            <li><span class="text-sm text-muted-foreground">Contact</span></li>
          </ul>
        </div>
        <div>
          <h4 class="text-sm font-semibold text-foreground mb-3">Company</h4>
          <ul class="space-y-2">
            <li><span class="text-sm text-muted-foreground">About</span></li>
            <li><span class="text-sm text-muted-foreground">Terms</span></li>
            <li><span class="text-sm text-muted-foreground">Privacy</span></li>
          </ul>
        </div>
      </div>

      <div class="border-t border-border mt-8 pt-8">
        <p class="text-xs text-muted-foreground text-center">
          &copy; 2026 FairTicket. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
