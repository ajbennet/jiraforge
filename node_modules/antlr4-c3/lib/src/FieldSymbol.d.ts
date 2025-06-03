import { MethodSymbol } from "./MethodSymbol";
import { VariableSymbol } from "./VariableSymbol";
/** A field which belongs to a class or other outer container structure. */
export declare class FieldSymbol extends VariableSymbol {
    setter?: MethodSymbol;
    getter?: MethodSymbol;
}
