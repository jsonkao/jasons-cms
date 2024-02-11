<script>
	const copy = [
		'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In quis risus ullamcorper massa ullamcorper euismod.',
		'Nam quis elementum tortor. Proin eleifend orci vitae turpis bibendum, ultricies consectetur ex fermentum.',
	]
</script>

<div class="container">
	<div class="background">
		<img alt="" src="https://static01.nytimes.com/newsgraphics/2023-01-20-asian-american-vote/171b03eeed7dcd32bb30326f4767e229c13601e6/_assets/basemaps/Brooklyn-fs8.png" />
		<img alt="" src="https://static01.nytimes.com/newsgraphics/2023-01-20-asian-american-vote/171b03eeed7dcd32bb30326f4767e229c13601e6/_assets/precincts/Brooklyn/2022.svg" />
	</div>
	<div class="foreground">
		{#each copy as text}
			<p>{text}</p>
		{/each}
	</div>
</div>

<style>
	.container {
		position: relative;
	}

	.background {
		position: sticky;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 90vh;
		top: 5vh;
	}

	.background img {
		height: 100%;
		width: 100%;
		object-fit: contain;
		position: absolute;
	}

	.foreground {
		margin-top: -50vh;
		padding-bottom: 10vh;
	}

	p {
		position: relative;
		z-index: 1;
		background: white;
		margin: 0 auto 60vh;
		max-width: 520px;
		padding: 10px 14px;
		box-shadow: 0px 2px 5px 0px #0003;
	}
</style>