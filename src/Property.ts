import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { DATA_TYPES } from "./utils/data-types";

import { BaseProperty, PropertyType } from "admin-bro";

export class Property extends BaseProperty
{
    public column: ColumnMetadata;

    constructor(column: ColumnMetadata)
    {
        // for reference fields take database name (with ...Id)
        const path = column.referencedColumn ? column.databaseName : column.propertyPath;
        super({ path });
        this.column = column;
    }

    public name()
    {
        return this.column.propertyName;
    }

    public isEditable()
    {
        return !this.isId()
            && !this.column.isCreateDate
            && !this.column.isUpdateDate;
    }

    public isId()
    {
        return this.column.isPrimary;
    }

    public reference(): string | null
    {
        const ref = this.column.referencedColumn;
        if (ref)
            return ref.entityMetadata.name;
        else
            return null;
    }

    public availableValues()
    {
        const values = this.column.enum;
        if (values)
            return values.map(val => val.toString());
        return null;
    }

    public type(): PropertyType
    {
        let type: PropertyType | null = null;
        if (typeof this.column.type == "function")
        {
            if (this.column.type == Number)
                type = "number";
            if (this.column.type == String)
                type = "string";
            if (this.column.type == Date)
                type = "datetime";
        }
        else
            type = DATA_TYPES[ this.column.type as any ];

        if (this.reference())
            return "reference";

        if (!type)
            console.warn(`Unhandled type: ${this.column.type}`);

        return type || "string";
    }
}