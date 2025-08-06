export interface IErrorMessage {
  setError: (value: string) => void;
  error: string;
  reload: () => void;
}