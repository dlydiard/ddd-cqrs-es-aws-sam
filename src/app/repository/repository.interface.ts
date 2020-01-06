// primitive filtering for purposes of this demo
export interface RepositoryFilter {
  contains?: string, // attribute:value
  limit?: number
}

export interface Repository<T> {
  /**
   * Get record by id
   * @param table
   * @param keyName
   * @param keyValue
   * @returns T
   */
  get(table: string, keyName: string, keyValue: string): Promise<T>;

  /**
   * Get records by filter.
   * @param table
   * @param filter
   * @returns Array of records
   */
  list(table: string, filter?: RepositoryFilter): Promise<Array<T>>;

  /**
   * Save record
   * @param table
   * @param model
   * @param optionalParams optional params to pass to the repository
   * @returns save output
   */
  save(table: string, model: T, optionalParams?: any): Promise<any>;

  /**
   * Delete a record by id
   * @param table
   * @param keyName
   * @param keyValue
   * @param optionalParams optional params to pass to the repository
   * @returns true if no errors
   */
  delete(table: string, keyName: string, keyValue: string, optionalParams?: any): Promise<boolean>;
}
