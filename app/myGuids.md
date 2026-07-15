# my mistakes and how i solved 



# techniques i have learnd

## react-pdf/renderer 
### why :
generate PDF in front or back depending on the goal so in this project we have used it in back end

### how to use it

1- in services/yourService.tsx  write your logic to get data and fill , use pdf/yourfilename.tsx as template to show it 

## PDF Generation (Service Layer)
// get data to fill and generate the pdf depend on pdf/PrescriptionTemplate.tsx as template if success save url in db

## TS 
### TS With obj
you use type Record<string, unknown> that mean the type of keys is string but type of valuse you don't know what type you will use it so put it unknown (better than any)
Example :
```TS
const selectedFields:Record<string , boolean>={name:true , email:true} 
selectedFields.phoneNumber = true;
```

### TS with ZOD


TODO:
