import { faker } from "@faker-js/faker";

function create(used = false) {
    return {
        code: faker.random.alphaNumeric(4),
        discount: faker.datatype.number({ min: 0, max: 100 }),
        used
    };
}

export default {
    create
}