export enum FactType {
    misc,
    general,
    problem,
    person,
    location,
    item
}


export class Fact {
    type: FactType;
    text = "";
    image?: string;
    constructor(type: FactType, text: string, image?: string) {
        this.text = text;
        this.type = type;
        if (image) this.image = image;
    }
}

export class Notebook {
    facts = new Set<Fact>();
}