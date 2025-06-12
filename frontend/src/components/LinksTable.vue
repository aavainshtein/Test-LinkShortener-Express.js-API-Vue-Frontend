<script setup lang="ts">
const linkInfoExample = JSON.parse(`{
    "id": "90aed485-8480-4137-9a2d-8c147d4276b0",
    "originalUrl": "https://www.youtube.com",
    "shortAlias": "ELlSIT4",
    "alias": null,
    "clickCount": 3,
    "clicks": [
        {
            "id": "c98daf06-5a7b-4b0d-8ef5-a142e66699ec",
            "ipAddress": "::ffff:172.18.0.1",
            "clickedAt": "2025-06-12T10:28:58.979Z"
        },
        {
            "id": "4009d948-9645-480f-9cae-12c1e8f43752",
            "ipAddress": "::ffff:172.18.0.1",
            "clickedAt": "2025-06-12T10:29:02.576Z"
        },
        {
            "id": "38403fff-46b5-41dc-9b3c-42217a8e26a1",
            "ipAddress": "::ffff:172.18.0.1",
            "clickedAt": "2025-06-12T10:29:05.780Z"
        }
    ]
}`)
</script>
<template>
  <UTable
    :data="linkInfoExample.clicks"
    :columns="columns"
    class="w-full max-w-4xl"
  />
</template>
