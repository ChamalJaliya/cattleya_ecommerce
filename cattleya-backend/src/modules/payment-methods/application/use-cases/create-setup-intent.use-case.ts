import { Injectable } from '@nestjs/common';
import { SetupIntentResponseDto } from '../dto/setup-intent-response.dto';

@Injectable()
export class CreateSetupIntentUseCase {
  async execute(userId: string): Promise<SetupIntentResponseDto> {
    // TODO: Implement actual Stripe integration
    return new SetupIntentResponseDto({
      clientSecret: 'mock_client_secret_' + Date.now(),
      id: 'mock_setup_intent_' + Date.now(),
    });
  }
} 