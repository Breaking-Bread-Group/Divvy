## API

```
/

Method: ANY

In: No body required

Out: {
  "ip": "string",
  "authenticated?": bool,
  "state": "string (logged in / logged out)",
  "user": {user data},
  "body": {req body}
}
```

```
/getuserdata

Method: GET

In: {
  "userID": number
}

Out: {
  "email": "string",
  "fname": "string",
  "lname": "string",
  "phone": "string (only provided if logged in as user)"
}
```

```
/searchusers

Method: GET

In: {
  "query": "string"
}

Out: {
  "userIDs": [number]
}
```

```
/login

Method: POST

In: {
  "username": "string",
  "password": "string"
}

Out: http code only
```

```
/logout

Method: DELETE

In: No body required

Out: http code only
```

```
/register

Method: POST

In: {
  "username": "string",
  "password": "string",
  "fname": "string",
  "lname": "string",
  "phone": "string (optional)"
}

Out: http code only
```

```
/updateprofile

Method: PUT

In: {
  "email": "string",
  "fname": "string",
  "lname": "string",
  "phone": "string"
}

Out: http code only
```

```
/updatepassword

Method: PUT

In: {
  "password": "string"
}

Out: http code only
```

```
/deleteuser

Method: DELETE

In: {
  "userID": number
}

Out: http code only
```

```
/newexpense

Method: POST

In: {
  "name": "string",
  "total": number,
  "useGroup": bool,
  "members": ["string"]
}

Out: {
  "expenseID": number
}
```

```
/getexpense

Method: GET

In: {
  "expenseID": number,
}

Out: {
  "name": "string",
  "total": number,
  "useGroup": bool,
  "members": ["string"],
  "active": bool,
  "settled": bool,
  "paid": bool,
  "creation_date": "string",
  "payment_date": "string?",
  "intent_id": "string"
}
```

```
/getexpenses

Method: GET

In: {
  "id": number,
  "type": number (check docs for issuerState)
}

Out: {
  "expenses": [number]
}
```

```
/updateexpense

Method: PUT

In: {
  "expenseID": number,
  "name": "string",
  "total": number,
  "useGroup": bool,
  "members": ["string"]
}

Out: http code only
```

```
/expensesplits

Method: GET

In: {
  "expenseID": number
}

Out: {
  "expensesplits": [
    {
      "expenseSplitID": number
      "userID": number,
      "splitpercentage": number,
      "accepted": bool,
      "paid": bool
    }
  ]
}
```

```
/deleteexpense

Method: DELETE

In: {
  "expenseID": number
}

Out: http code only
```

```
/acceptpercent

Method: PUT

In: {
  "expenseSplitID": number,
  idk the best way to format payment data here yet,
  looking into it
}

Out: http code only
```

```
/setpercentage

Method: PUT

In: {
  "expenseSplitID": number,
  "splitpercentage": number
}

Out: http code only
```

```
/getvirtualcard

Method: GET

In: {
  "expenseID": number
}

Out: {
  "card_number": "string",
  "exp_month": "string",
  "exp_year": "string",
  "cvc": "string",
  "cardholder_name": "string (group leader)",
  "billing_address": {
    "line1": "string (group leader)",
    "city": "string (group leader)",
    "state": "string (group leader)",
    "postal_code": "string (group leader)",
    "country": "string (group leader)"
  }
}
```

```
/scheduleexpense

Method: POST

In: {
  "expenseID": number,
  "dueDate": "string",
  "repeat": bool,
  "repeatTime": number
}

Out: http code only
```

```
/getschedule

Method: GET

In: {
  "scheduleID": number,
}

Out: {
  "dueDate": "string",
  "repeat": bool,
  "repeatTime": number
}
```

```
/getsingleschedules

Method: GET

In: {
  "expenseID": number,
}

Out: {
  "schedules": [number]
}
```

```
/getentschedules

Method: GET

In: {
  "id": number,
  "type": number (check docs for issuerState)
}

Out: {
  "schedules": [number]
}
```

```
/updateschedule

Method: PUT

In: {
  "scheduleID": number,
  "dueDate": "string",
  "repeat": bool,
  "repeatTime": number
}

Out: http code only
```

```
/deleteschedule

Method: DELETE

In: {
  "scheduleID": number
}

Out: http code only
```

```
/creategroup

Method: POST

In: {
  "name": "string"
}

Out: {
  "groupID": number
}
```

```
/editgroup

Method: PUT

In: {
  "groupID": number,
  "name": "string",
  "adminID": number
}

Out: http code only
```

```
/deletegroup

Method: DELETE

In: {
  "groupID": number
}

Out: http code only
```

```
/getgroups

Method: GET

In: No body required

Out: {
  "groups": [
    {
      "groupID": number,
      "name": "string",
      "adminID": number,
      "memberIDs": [number]
    }
  ]
}
```

```
/joingroup

Method: POST

In: {
  "groupID": number
}

Out: http code only
```

```
/removemember

Method: DELETE

In: {
  "groupID": number,
  "userID": number
}

Out: http code only
```

```
/invitemember

Method: POST

In: {
  "groupID": number,
  "userID" number
}

Out: http code only
```

```
/getlogs

Method: GET

In: {
  "ID": number,
  "type": number (check docs for issuerState),
  "verbosity": number
}

Out: {
  "logs": [
    {
      "log_time": "string",
      "message": "string"
    }
  ]
}
```
