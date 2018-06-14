
type Showable = {
  show(): void;
};

/**
 * Represents a scene containing objects which can be drawn on the canvas.
 */
export default class Scene {

  private objects: Showable[] = [];


  public constructor() { }

  /**
   * Adds some objects to the scene.
   * 
   * @param objects The objects to add to the scene
   */
  public add(...objects: Showable[]): void {
    this.objects = this.objects.concat(objects);
  }

  /**
   * Removes some objects from the scene.
   * 
   * @param object The objects to remove from the scene
   */
  public remove(...objects: Showable[]): void {
    this.objects = this.objects.filter(x => objects.indexOf(x) === -1);
  }

  /**
   * Shows all the objects which have been added to the scene.
   */
  public render(): void {
    for (const object of this.objects) {
      object.show();
    }
  }

}
