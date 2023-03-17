import { faker } from '@faker-js/faker';
import { jest } from '@jest/globals';
import voucherRepository from 'repositories/voucherRepository';
import voucherService from '../../src/services/voucherService';
import voucherFactory from '../factories/voucherFactory';

describe('voucherService', () => {
    it('should create a voucher', async () => {
        const voucher = voucherFactory.create();

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => undefined);
        jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => voucher);

        await voucherService.createVoucher("CODE", 0);

        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.createVoucher).toHaveBeenCalled();
    });

    it('should throw an error if voucher already exists', async () => {
        const voucher = voucherFactory.create();

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => voucher);
        jest.spyOn(voucherRepository, "createVoucher").mockImplementationOnce((): any => voucher);
    
        const promise = voucherService.createVoucher(voucher.code, voucher.discount);

        expect(promise).rejects.toEqual({ type: "conflict", message: "Voucher already exist." });
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.createVoucher).not.toHaveBeenCalled();
    });

    it('should apply a voucher', async () => {
        const voucher = voucherFactory.create();
        const amount = faker.datatype.number({ min: 100 });

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => voucher);
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => {
            voucher.used = true;
            return voucher;
        });

        const result = await voucherService.applyVoucher(voucher.code, amount);

        expect(result).toEqual({
            amount,
            discount: voucher.discount,
            finalAmount: amount - (amount * (voucher.discount / 100)),
            applied: true
        });
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.useVoucher).toHaveBeenCalled();
    });

    it('should not apply a voucher with amount less than 100', async () => {
        const voucher = voucherFactory.create();
        const amount = faker.datatype.number({ max: 99 });

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => voucher);
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => voucher);

        const result = await voucherService.applyVoucher(voucher.code, amount);

        expect(result).toEqual({
            amount,
            discount: voucher.discount,
            finalAmount: amount,
            applied: false
        });
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.useVoucher).not.toHaveBeenCalled();
    });

    it('should not apply a voucher if not exists', async () => {
        const voucher = voucherFactory.create();
        const amount = faker.datatype.number();

        jest.spyOn(voucherRepository, "getVoucherByCode").mockImplementationOnce((): any => undefined);
        jest.spyOn(voucherRepository, "useVoucher").mockImplementationOnce((): any => voucher);

        const promise = voucherService.applyVoucher(voucher.code, amount);

        expect(promise).rejects.toEqual({ type: "conflict", message: "Voucher does not exist." });
        expect(voucherRepository.getVoucherByCode).toHaveBeenCalled();
        expect(voucherRepository.useVoucher).not.toHaveBeenCalled();
    });
});