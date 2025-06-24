export class SetupIntentResponseDto {
  clientSecret: string;
  id: string;

  constructor(data: SetupIntentResponseDto) {
    Object.assign(this, data);
  }
} 