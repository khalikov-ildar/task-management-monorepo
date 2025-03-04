// eslint-disable-next-line @typescript-eslint/no-unused-vars
export abstract class Query<TEntity> {
  public readonly pageNumber: number;
  public readonly pageSize: number;
  protected constructor(pageSize?: number, pageNumber?: number) {
    let finalPageSize = 20;
    let finalPageNumber = 1;

    if (pageSize !== undefined) {
      finalPageSize = pageSize;
    }

    if (finalPageSize < 10) {
      finalPageSize = 10;
    } else if (finalPageSize > 50) {
      finalPageSize = 50;
    }

    if (pageNumber !== undefined) {
      finalPageNumber = pageNumber;
    }

    if (finalPageNumber < 1) {
      finalPageNumber = 1;
    }

    this.pageSize = finalPageSize;
    this.pageNumber = finalPageNumber;
  }
}
