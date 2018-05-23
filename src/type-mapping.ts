export class TypeMapping {
    static  mappings: TypeMap[] = [
      {CSharpType:"int",TSType:"number"},
      {CSharpType:"int32",TSType:"number"},
      {CSharpType:"long",TSType:"number"},
      {CSharpType:"int64",TSType:"number"},
      {CSharpType:"short",TSType:"number"},
      {CSharpType:"int16",TSType:"number"},
      {CSharpType:"byte",TSType:"number"},
      {CSharpType:"bool",TSType:"boolean"},
      {CSharpType:"string",TSType:"string"},
     
  ];

  static getTSType(cSharpType: string): string {
        const isTypeArray = cSharpType.endsWith("[]");
        if (isTypeArray) {
            cSharpType = cSharpType.replace("[]", "");
        }

        const type = this.mappings.find(el => el.CSharpType === cSharpType.toLowerCase());
        if (!type) {
            return cSharpType;
        }
        return type.TSType + (isTypeArray?"[]":"");
    }
}

class TypeMap {
  constructor(public CSharpType: string, public TSType: string) {}
}
