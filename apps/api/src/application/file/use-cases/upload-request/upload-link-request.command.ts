export class UploadLinkRequestCommand {
  constructor(
    public readonly fileName: string,
    public readonly type: string,
    public readonly size: number,
  ) {}
}
