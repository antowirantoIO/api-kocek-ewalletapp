import { Module } from '@nestjs/common';
import { SettingRepositoryModule } from 'src/modules/setting/repository/setting.repository.module';
import { SettingService } from './services/setting.service';

@Module({
    imports: [SettingRepositoryModule],
    exports: [SettingService],
    providers: [SettingService],
    controllers: [],
})
export class SettingModule {}
