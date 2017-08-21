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
**roleObjectKey** | `false` | `string` | The name of the user object on the express request object which holds the role field<br>**Default Value**: `user`
**defaultRole** | `false` | `string` | This is the role that will be given to users which do not have a role set for them.

Example:
```js
acl.config({
  path: 'path/to/rule/list',
  roleObjectKey: 'myUser',
  defaultRole: 'guest'
});
```

## Rule File
You have to supply a rule file to the module which is built in the following way:
1. The file needs to be a **JSON** file
2. The JSON keys will be the roles you want in your system
3. Every role will hold an array of routes you want to allow or deny access to

**Basic Example**:
```json
{
  "guest": [
      {
        "route": "/public",
        "methods": [
          "GET"
        ],
        "action": "allow"
      },
      {
        "route": "/private",
        "methods": "*",
        "action": "deny"
      }
    ],
    "admin": [
      {
        "route": "*",
        "methods": "*",
        "action": "allow"
      }
    ]
}
```

As seen in the example above, every rule will hold the following fields:

Field | Type | Description
| --- | --- | --- |
**route** | `string` | The path for the rule to be applied on
**methods** | `string or array` | An array of HTTP methods to apply this rule on, or `*` for all methods
**action** | `string` | The action to apply for all requests this rule applies for. Values must be `allow` or `deny`

## Advanced Features

### URL Parameters
You can use the Express styled url parameters in your path, i.e.: `/path/with/:param`

### Sub-routes
Every rule can have another field which is called `subroutes`. this is another array of rules which will allow you a more granular control over which routes to allow and deny access to according to your logic.<br/>
**Example**:
```js
{
  "guest": [
    {
      "path": "/api",
      "method": "*",
      "action": "allow",
      "subroutes": [
        {
          "path": "/public", // Translates to /api/public
          "method": ["GET"],
          "action": "allow"
        },
        {
          "path": "/private", // Translates to /api/private
          "method": "*",
          "action": "deny"
        }
      ]
    }
  ]
}
``` 

# License

See the [LICENSE](https://github.com/Vonage/acl-express/blob/master/LICENSE.txt) file for license rights and limitations (Apache License, Version 2.0)
