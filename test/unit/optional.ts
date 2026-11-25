import { assert } from "chai";
import {
    DescriptorProto, FieldDescriptorProto, FileDescriptorProto
} from "google-protobuf/google/protobuf/descriptor_pb";
import { ExportMap } from "../../src/ExportMap";
import { printMessage } from "../../src/ts/message";

describe("proto3 optional AsObject", () => {
    const cases = [
        { type: FieldDescriptorProto.Type.TYPE_FLOAT, expected: "number" },
        { type: FieldDescriptorProto.Type.TYPE_UINT32, expected: "number" },
        { type: FieldDescriptorProto.Type.TYPE_STRING, expected: "string" },
        { type: FieldDescriptorProto.Type.TYPE_BOOL, expected: "boolean" },
    ];

    cases.forEach(({ type, expected }) => {
        [false, true].forEach(optional => {
            it(`field type ${type}, optional=${optional}`, () => {
                const file = new FileDescriptorProto();
                file.setName("check.proto");
                file.setSyntax("proto3");
                const message = new DescriptorProto();
                message.setName("Detection");
                const field = new FieldDescriptorProto();
                field.setName("value");
                field.setNumber(1);
                field.setType(type);
                field.setLabel(FieldDescriptorProto.Label.LABEL_OPTIONAL);
                if (optional) {
                    field.setProto3Optional(true);
                    field.setOneofIndex(0);
                    message.addOneofDecl().setName("_value");
                }
                message.addField(field);
                file.addMessageType(message);
                const exports = new ExportMap();
                exports.addFileDescriptor(file);
                const output = printMessage("check.proto", exports, message, 0, file);
                assert.include(output, `value${optional ? "?" : ""}: ${expected},`);
                assert.include(output, `getValue(): ${expected};`);
                assert.include(output, `setValue(value: ${expected}): void;`);
            });
        });
    });
});