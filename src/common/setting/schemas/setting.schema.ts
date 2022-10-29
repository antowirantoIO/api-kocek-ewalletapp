import { Schema as MongooseSchema } from 'mongoose';
import {
    DatabaseEntity,
    DatabaseProp,
    DatabasePropPrimary,
    DatabaseSchema,
} from 'src/common/database/decorators/database.decorator';
import { IDatabaseSchema } from 'src/common/database/interfaces/database.interface';

@DatabaseEntity({ timestamps: true, versionKey: false })
export class SettingEntity {
    @DatabasePropPrimary()
    _id?: string;

    @DatabaseProp({
        required: true,
        index: true,
        unique: true,
        trim: true,
    })
    name: string;

    @DatabaseProp({
        required: false,
    })
    description?: string;

    @DatabaseProp({
        required: true,
        trim: true,
        type: MongooseSchema.Types.Mixed,
    })
    value: string | number | boolean;
}

export const SettingDatabaseName = 'settings';

export const SettingSchema = DatabaseSchema(SettingEntity);
export type Setting = IDatabaseSchema<SettingEntity>;
