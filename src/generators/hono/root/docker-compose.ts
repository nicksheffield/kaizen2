import { ProjectCtx } from '@/generators/hono/types'
import { stringify } from 'yaml'

const tmpl = ({ project }: { project: ProjectCtx }) => {
	// 	// const settings = project.project
	const secrets = project.env

	// const node = {
	// 	image: 'node:18',
	// 	working_dir: '/home/node/app',
	// 	volumes: ['./:/home/node/app'],
	// 	expose: [8000],
	// 	environment: {
	// 		VIRTUAL_HOST: `www.${settings.domainName},${settings.domainName}`,
	// 		VIRTUAL_PORT: 8000,
	// 	},
	// 	command: `sh -c "npm install && npm run dev"`,
	// 	depends_on: ['db'],
	// 	links: ['db'],
	// }

	// const nginx = {
	// 	image: 'nginxproxy/nginx-proxy:1.4',
	// 	restart: 'always',
	// 	ports: ['80:80', '443:443'],
	// 	volumes: ['/var/run/docker.sock:/tmp/docker.sock:ro', '/etc/ssl/nginx:/etc/nginx/certs'],
	// }

	const db = {
		image: 'mariadb',
		restart: 'always',
		environment: {
			MYSQL_USER: secrets?.MYSQL_USER || '',
			MYSQL_PASSWORD: secrets?.MYSQL_PASSWORD || '',
			MYSQL_DATABASE: 'db',
			MARIADB_ROOT_PASSWORD: secrets?.MARIADB_ROOT_PASSWORD || '',
		},
		volumes: ['database:/var/lib/mysql'],
		ports: ['3307:3306'],
	}

	const adminer = {
		image: 'adminer',
		restart: 'always',
		ports: ['9191:8080'],
		links: ['db'],
	}

	const volumes = {
		database: null,
	}

	return stringify(
		{
			version: '3.1',
			services: {
				// node,
				db,
				adminer,
				// nginx
			},
			volumes,
		},
		null,
		4
	)
}

export default tmpl
