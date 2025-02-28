export class Query<TEntity, TFilterBy extends keyof TEntity = keyof TEntity> {
  public readonly pageNumber: number;
  protected constructor(
    public readonly pageSize: number,
    pageNumber?: number,
    public readonly filterBy?: Filter<TEntity, TFilterBy>,
    public readonly sortBy?: string,
    public readonly sortAscending: boolean = true,
  ) {
    this.pageNumber = pageNumber || 1;
  }
}

export type Filter<TObject, TKey extends keyof TObject = keyof TObject> = Record<TKey, any>;
