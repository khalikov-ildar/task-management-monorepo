import { Query } from '../../common/repository/query';

class ConcreteQuery extends Query<any> {
  constructor(pageSize?: number, pageNumber?: number) {
    super(pageSize, pageNumber);
  }
}

describe('Query Class', () => {
  it('Should set default pageSize to 20 when no pageSize is provided', () => {
    const query = new ConcreteQuery();
    expect(query.pageSize).toBe(20);
  });

  it('Should set pageSize to 10 when a value less than 10 is provided', () => {
    const query = new ConcreteQuery(5);
    expect(query.pageSize).toBe(10);
  });

  it('Should set pageSize to 50 when a value greater than 50 is provided', () => {
    const query = new ConcreteQuery(60);
    expect(query.pageSize).toBe(50);
  });

  it('Should accept pageSize within the valid range (10-50)', () => {
    const query = new ConcreteQuery(30);
    expect(query.pageSize).toBe(30);
  });

  it('Should set default pageNumber to 1 when no pageNumber is provided', () => {
    const query = new ConcreteQuery(undefined, undefined);
    expect(query.pageNumber).toBe(1);
  });

  it('Should set pageNumber to 1 when a value less than 1 is provided', () => {
    const query = new ConcreteQuery(undefined, 0);
    expect(query.pageNumber).toBe(1);
  });

  it('Should accept valid pageNumber values greater than or equal to 1', () => {
    const query = new ConcreteQuery(undefined, 5);
    expect(query.pageNumber).toBe(5);
  });

  it('Should handle both pageSize and pageNumber correctly', () => {
    const query = new ConcreteQuery(40, 3);
    expect(query.pageSize).toBe(40);
    expect(query.pageNumber).toBe(3);
  });

  it('Should handle all edge cases together', () => {
    const query = new ConcreteQuery(9, 0);
    expect(query.pageSize).toBe(10);
    expect(query.pageNumber).toBe(1);
  });
});
