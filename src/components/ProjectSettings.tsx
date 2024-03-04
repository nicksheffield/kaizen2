import { useApp } from '@/lib/AppContext'

export const ProjectSettings = () => {
	const { project } = useApp()

	return (
		<div className="flex flex-col p-2 gap-2">
			<div className="flex items-center gap-2">
				<div className="font-bold">Name:</div>
				<div>{project?.project.name}</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="font-bold">name</div>
				<div>{project?.project.name}</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="font-bold">repoUrl</div>
				<div>{project?.project.repoUrl}</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="font-bold">domainName</div>
				<div>{project?.project.domainName}</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="font-bold">maxBodySize</div>
				<div>{project?.project.maxBodySize}</div>
			</div>
			<div className="flex items-center gap-2">
				<div className="font-bold">connectionTimeout</div>
				<div>{project?.project.connectionTimeout}</div>
			</div>
		</div>
	)
}
