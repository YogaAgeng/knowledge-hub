export default class Document {
    constructor(id = null, title = '', content = '', type = '', tags = []) {
      this.id = id;
      this.title = title;
      this.content = content;
      this.type = type;
      this.tags = tags;
    }
  }