export class PaginatedResult<T> {
  public totalPages: number;
  public hasNextPage: boolean;
  public hasPreviousPage: boolean;
  constructor(
    public readonly totalCount: number,
    public readonly pageNumber: number,
    public readonly pageSize: number,
    public readonly items: T[] = [],
  ) {
    this.totalPages = Math.ceil(this.totalCount / this.pageSize);
    this.hasNextPage = this.pageNumber < this.totalPages;
    this.hasPreviousPage = this.pageNumber > 1;
  }
}
