<template>

</template>

<script setup lang='ts'>
import { H5SSE } from './H5SSE';
import { MPSSSE } from './MPSSE';

const H5SSEInstance = new H5SSE({
    url: '',
    onMessage: (msg) => {

    },
    onError: (err) => {

    }
})
const MPSSEInstance = new MPSSSE({
    url: '',
    onMessage: (msg) => {

    },
    onError: (err) => {

    }
})
</script>

<style scoped></style>