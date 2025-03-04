import { PaginatedResult } from '../../common/repository/paginated-result';

describe('PaginatedResult tests', () => {
  interface TestItem {
    id: number;
    name: string;
  }

  const generateItems = (count: number): TestItem[] => {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
    }));
  };

  it('Should correctly compute totalPages', () => {
    const totalCount = 100;
    const pageSize = 20;
    const pageNumber = 1;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize, generateItems(20));
    expect(result.totalPages).toBe(5);
  });

  it('Should have a next page when pageNumber is less than totalPages', () => {
    const totalCount = 50;
    const pageSize = 10;
    const pageNumber = 3;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize, generateItems(10));
    expect(result.hasNextPage).toBe(true);
  });

  it('Should not have a next page when pageNumber equals totalPages', () => {
    const totalCount = 50;
    const pageSize = 10;
    const pageNumber = 5;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize, generateItems(10));
    expect(result.hasNextPage).toBe(false);
  });

  it('Should not have a previous page when pageNumber is 1', () => {
    const totalCount = 50;
    const pageSize = 10;
    const pageNumber = 1;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize, generateItems(10));
    expect(result.hasPreviousPage).toBe(false);
  });

  it('Should have a previous page when pageNumber is greater than 1', () => {
    const totalCount = 50;
    const pageSize = 10;
    const pageNumber = 2;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize, generateItems(10));
    expect(result.hasPreviousPage).toBe(true);
  });

  it('Should handle cases where totalCount is not a multiple of pageSize', () => {
    const totalCount = 45;
    const pageSize = 10;
    const pageNumber = 1;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize, generateItems(10));
    expect(result.totalPages).toBe(5);
  });

  it('Should work correctly with an empty items array', () => {
    const totalCount = 0;
    const pageSize = 10;
    const pageNumber = 1;
    const result = new PaginatedResult<TestItem>(totalCount, pageNumber, pageSize);
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(0);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(false);
  });
});
