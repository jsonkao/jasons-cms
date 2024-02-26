export async function createDeployment() {
	const response = await fetch(
		`https://api.vercel.com/v1/integrations/deploy/prj_nPf3nqQKww7UmSbouxEFhMcbmfhh/PoBMjAEPUN`,
		{
			method: 'POST'
		}
	);
	const jobData = await response.json();

	console.log(jobData, response.status);
}
