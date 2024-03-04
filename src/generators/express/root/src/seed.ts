const tmpl = () => `import { initializedOrm } from '~/orm'
import { User } from '~/orm/entities/User'
import bcrypt from 'bcryptjs'
import { migrate } from '~/migrate'

initializedOrm.then(async (orm) => {
	await migrate()

	const user = await orm.manager.findOne(User, { where: { name: 'admin' } })

	if (user) {
		console.log('Admin user exists')
		orm.destroy()
		return
	}

	const admin = new User()

	admin.name = 'admin'
	admin.email = 'admin@example.com'
	admin.password = bcrypt.hashSync('letmein', 10)

	await orm.manager.save(admin)

	console.log('Admin user created')

	orm.destroy()
})
`

export default tmpl
