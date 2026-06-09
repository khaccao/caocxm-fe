/* eslint-disable import/order */
import { useState } from "react";

import { Button, Col, Form, Input, Row } from "antd";

import { useAppDispatch } from "@/store/hooks";
import { accountingInvoiceActions } from "../../../../../store/accountingInvoice/accountingInvoiceSlice";

export interface Customer {
    key?: string; // Unique key for each customer
    madvcs: string;
    ma_kh: string;
    ten_kh: string;
    ma_Dia_Chi?: string;
    dia_Chi?: string;
    dien_Thoai?: string;
    ms_Thue?: string;
    so_Tk?: string;
    email?: string;
    web?: string;
    ngan_Hang?: string;
    ghi_Chu?: string;
}

const AddNcc: React.FC<{ onSaveSuccess: () => void }> = ({ onSaveSuccess })=> {
    const [formData, setFormData] = useState<Customer>({
        key: '1',
        madvcs: 'THUCHIEN',
        ma_kh: '',
        ten_kh: '',
        ma_Dia_Chi: '',
        dia_Chi: '', 
        dien_Thoai: '',
        ms_Thue: '',
        so_Tk: '',
        email: '',
        web: '',
        ngan_Hang: '',
        ghi_Chu: ''
    });

    const dispatch = useAppDispatch();

    const handleSave = () => {
        // Exclude 'key' from formData when dispatching
        const { key, ...dataWithoutKey } = formData;
        dispatch(accountingInvoiceActions.newCustomers({ data: [dataWithoutKey], params: {} }));
        onSaveSuccess(); 
    };

    const handleInputChange = (field: keyof Customer, value: string) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    };

    return (
        <Form layout="vertical">
    <Row gutter={12}>
        <Col span={10}>
            <Form.Item
                label={
                    <span>
                        Mã khách hàng
                    </span>
                }
                style={{ marginBottom: '4px' }}
                name="ma_kh"
                rules={[{ required: true, message: 'Mã khách hàng là bắt buộc' }]}
            >
                <Input
                    value={formData.ma_kh}
                    onChange={(e) => handleInputChange('ma_kh', e.target.value)}
                />
            </Form.Item>
        </Col>
        <Col span={14}>
            <Form.Item
                label={
                    <span>
                        Tên khách hàng
                    </span>
                }
                style={{ marginBottom: '4px' }}
                name="ten_kh"
                rules={[{ required: true, message: 'Tên khách hàng là bắt buộc' }]}
            >
                <Input
                    value={formData.ten_kh}
                    onChange={(e) => handleInputChange('ten_kh', e.target.value)}
                />
            </Form.Item>
        </Col>
    </Row>
            <Row gutter={12}>
                <Col span={24}>
                    <Form.Item label="Địa chỉ" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.dia_Chi}
                            onChange={(e) => handleInputChange('dia_Chi', e.target.value)}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                <Col span={8}>
                    <Form.Item label="SĐT" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.dien_Thoai}
                            onChange={(e) => handleInputChange('dien_Thoai', e.target.value)}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Mã số thuế" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.ms_Thue}
                            onChange={(e) => handleInputChange('ms_Thue', e.target.value)}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item label="Số tài khoản" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.so_Tk}
                            onChange={(e) => handleInputChange('so_Tk', e.target.value)}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item label="Ngân hàng" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.ngan_Hang}
                            onChange={(e) => handleInputChange('ngan_Hang', e.target.value)}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Email" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                <Col span={24}>
                    <Form.Item label="Trang web" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.web}
                            onChange={(e) => handleInputChange('web', e.target.value)}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={12}>
                <Col span={24}>
                    <Form.Item label="Ghi chú" style={{ marginBottom: '4px' }}>
                        <Input
                            value={formData.ghi_Chu}
                            onChange={(e) => handleInputChange('ghi_Chu', e.target.value)}
                        />
                    </Form.Item>
                </Col>
            </Row>
            <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <Button type="primary" onClick={handleSave}>
                    Lưu
                </Button>
            </div>
        </Form>
    );
};

export default AddNcc;
