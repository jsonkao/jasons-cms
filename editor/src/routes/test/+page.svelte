<script>
	let iframeElement;
  let ready;

	$: if (ready && iframeElement) {
		console.log('iframeElement ready', iframeElement);
		iframeElement.contentWindow?.postMessage({ type: 'setBlocks', blocks: [], other: 'HI' }, '*');
	}

  function onMessage(event) {
    console.log('Message received from the child: ' + JSON.stringify(event.data)); // Message received from child
    ready = true;
  }
</script>

<svelte:window on:message={onMessage} />

<iframe src="/" bind:this={iframeElement} />
hi