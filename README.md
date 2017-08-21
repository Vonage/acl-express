# ACL-Express

A stateless access control middleware for Express servers

## Installation
Install using `npm`:
```bash
$ npm install @vonage/acl-express
```

then in your project require the package:
```js
const acl = require('@vonage/acl-express');
```

lastly, you must configure the module for it to work:
```js
acl.config({...});
```

## Configuration
You must supply a configuration object to the module for it to work.<br/>
You can use the following configurations:

Property | Required | Type | Description
| --- | --- | --- | --- |
**path** | `true` | `string` | This is the path for your rules file 
**roleObjectKey** | `false` | `string` | The name of the user object on the express request object.<br>**Default Value**: `user`
**defaultRole** | `false` | `string` | This is the role that will be given to users which do not have a role set for them.

Example:
```js
acl.config({
	path: 'path/to/rule/list',
	roleObjectKey: 'myUser',
	defaultRole: 'guest'
});
```

# License

See the [LICENSE](https://github.com/Vonage/acl-express/blob/master/LICENSE.txt) file for license rights and limitations (Apache License, Version 2.0)
