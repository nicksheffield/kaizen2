todo

[x] need to add a new field to attrs, like selectable, called "insertable"
[x] add support for enabling/disabling both cookie and bearer based auth
[x] add support for customising auth timing
[x] manageUser.ts and all uses of its exported functions should handle any user defined fields
[x] add a user model id to the project so we know which model is the user one.
This allows us to add a "default to current user" option to a relation with a user.
[x] add new auth tables to schema.json
[ ] add support for auto increment
[ ] wipe expired sessions when a user logs in
[ ] also wipe old email verifications and password resets
[ ] add fault tolerance and upgrading to project.json
