export class EnumStore {
	private static enums: { [key: string]: string[] } = {}
	
	static setEnums(enums: { [key: string]: string[] }) {
		this.enums = enums
	}
	
	static getEnum(name: string) {
		return this.enums[name]
	}
}