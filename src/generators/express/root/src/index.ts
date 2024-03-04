const tmpl = ({ apiEnabled }: { apiEnabled: boolean }) => `import { migrate } from '~/migrate'
${apiEnabled ? `import http from '~/api'\n` : ''}

async function run() {
	migrate()
	${apiEnabled ? `http()` : ''}
}

run()

process.on('uncaughtException', function (err) {
	console.log(err)
})
`

export default tmpl
