export class AIManagerMock {
  async complete(_prompt: string){
    return { text: '' };
  }
}
