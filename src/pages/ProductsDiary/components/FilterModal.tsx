import { useState } from "react";

import { Button, DatePicker, Form, Input, Modal, Spin } from "antd";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";


import AutoCompleteCustom from "@/pages/MachineryMaterials/components/AutoCompleteCustom";
import { accountingInvoiceActions, getNccList, getProducts, getWareHouses } from '@/store/accountingInvoice';
import { useAppSelector } from "@/store/hooks";
import { getLoading } from '@/store/loading';
import { getProjectWarehouses, getSelectedProject, projectActions } from "@/store/project";
import { RootState } from "@/store/types";
import Utils from "@/utils";

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
    const listWarehouse = useAppSelector(getWareHouses());
    const products = useAppSelector(getProducts());
    const isLoading = useAppSelector(getLoading('BaoCaoChiTietNhapXuatVatTuRequest'));
    const selectedProject = useAppSelector(getSelectedProject());
    const listProjectWareHouse = useAppSelector(getProjectWarehouses());
    const projectList = useAppSelector(state => state.project.projectList);
    const projectwareHouses = useAppSelector((state: RootState) => state.project.projectwarehouseResponse);

    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [keyAutoComplete, setKeyAutoComplete] = useState<string>('111');
    const nccList = useAppSelector(getNccList());
    const currentWarehouseCodeMM = selectedProject
        ? listProjectWareHouse && listProjectWareHouse.length > 0
            ? listProjectWareHouse.find(wh => wh.warehouseCode.includes('CCDC'))?.warehouseCode
            : '' // Không gán giá trị nếu projectwareHouses rỗng
        : '';
    const currentWarehouseCodeVT = selectedProject
        ? listProjectWareHouse && listProjectWareHouse.length > 0
            ? listProjectWareHouse.find(wh => !wh.warehouseCode.includes('CCDC'))?.warehouseCode
            : '' // Không gán giá trị nếu projectwareHouses rỗng
        : '';
    const filteredWarehouses = listWarehouse.filter(w =>
        w.ma_kho === currentWarehouseCodeVT || w.ma_kho === currentWarehouseCodeMM
    );
    const warehouseSource = (listProjectWareHouse && listProjectWareHouse.length > 0) ? filteredWarehouses : listWarehouse;
    const [khoanMuc, setKhoanMuc] = useState<string>('');
    const handleSave = () => {
        form.validateFields().then(values => {
            const [startDayjs, endDayjs] = values.dateRange || [];

            const params = {
                ...values,
                tu_ngay: startDayjs?.format('YYYY-MM-DD'),
                den_ngay: endDayjs?.format('YYYY-MM-DD'),
            };

            delete params.dateRange; // Xóa trường không cần thiết

            console.log("Dispatching params:", params);
            dispatch(accountingInvoiceActions.getBaoCaoChiTietNhapXuatVatTuRequest({ params }));
            onClose(); // Đóng modal sau khi lưu
        }).catch(errorInfo => {
            console.error("Validation failed:", errorInfo);
        });
    };

    return (
        <Modal
            title="Bộ lọc"
            open={true}
            onCancel={() => { onClose(); }}
            footer={null}
        >
            <Spin spinning={isLoading}>
                <Form
                    layout="vertical"
                    form={form}
                    initialValues={{
                        madvcs: 'THUCHIEN',
                        maKhoanMuc: '',
                        maVuViec: '',
                        maKhachHang: '',
                        reportTemplateRecID: '598',
                        selectedWareHouse: '',
                        selectedProduct: '',
                        tu_ngay: dayjs().startOf('month').format("YYYY-MM-DD"),
                        den_ngay: dayjs().endOf('month').format("YYYY-MM-DD"),
                    }}
                >
                    <Form.Item
                        label="Mã DVCS"
                        name="madvcs"
                        rules={[{ required: true, message: 'Vui lòng nhập Mã DVCS' }]}
                    >
                        <Input placeholder="Mã DVCS" />
                    </Form.Item>
                    <Form.Item
                        label="Khoảng thời gian"
                        name="dateRange"
                        initialValue={[dayjs().startOf('month'), dayjs().endOf('month')]}
                    >
                        <DatePicker.RangePicker />
                    </Form.Item>

                    <Form.Item
                        label="Mã khoản mục"
                        name="ma_khoan_muc"
                        initialValue={selectedProject ? selectedProject.code : ''}
                    >
                        <AutoCompleteCustom
                            id=""
                            keyElement={keyAutoComplete}
                            value={selectedProject ? selectedProject.code : form.getFieldValue("ma_khoan_muc")}
                            optionsList={projectList.map(p => ({
                                label: `${p.code} / ${p.name}`,
                                value: p.code,
                                item: {
                                    name: p.name,
                                    code: p.code,
                                },
                            }))}
                            onSelect={(id, data, label, item) => {
                                if (!selectedProject) {
                                    if (!item?.code) {
                                        form.setFieldsValue({ ma_khoan_muc: '', ma_kho: '' });
                                    } else {
                                        form.setFieldsValue({ ma_khoan_muc: item.code });
                                        const project = projectList.find(p => p.name === data || p.code === data);
                                        dispatch(projectActions.getWarehousesRequest({ projectId: project?.id }));
                                    }
                                    setKeyAutoComplete(Utils.generateRandomString(3));
                                }
                            }}
                            onBlur={(id, data) => {
                                if (!selectedProject) {
                                    if (!data) {
                                        form.setFieldsValue({ ma_khoan_muc: '' });
                                    } else {
                                        const project = projectList.find(p => p.name === data || p.code === data);
                                        if (project) {
                                            form.setFieldsValue({ ma_khoan_muc: project.code });
                                        } else {
                                            form.setFieldsValue({ ma_khoan_muc: '' });
                                        }
                                    }
                                }
                            }}
                            placeholder="Chọn mã khoản mục"
                            className=""
                            onChange={(input: string, data: string) => { form.setFieldsValue({ ma_khoan_muc: data }); setKhoanMuc(data) }}
                            warning=""
                            disabled={!!selectedProject}
                        />
                    </Form.Item>

                    <Form.Item label="Mã kho" name="ma_kho">
                        <AutoCompleteCustom
                            id=""
                            keyElement={keyAutoComplete}
                            value={form.getFieldValue("ma_kho")}
                            optionsList={
                                khoanMuc
                                    ? (
                                        // Nếu đã chọn mã khoản mục, lọc warehouse theo projectwareHouses
                                        listWarehouse.filter(w =>
                                            projectwareHouses?.some(pw => pw.warehouseId === w.id)
                                        ).map(w => ({
                                            label: `${w.ma_kho || w.id} / ${w.ten_kho}`,
                                            value: `${w.ma_kho || w.id}`,
                                            item: {
                                                name: w.ten_kho,
                                                code: `${w.ma_kho || w.id}`,
                                            },
                                        }))
                                    )
                                    : (
                                        // Nếu chưa chọn mã khoản mục, lấy warehouseSource
                                        listWarehouse.map(w => ({
                                            label: `${w.ma_kho || w.id} / ${w.ten_kho}`,
                                            value: `${w.ma_kho || w.id}`,
                                            item: {
                                                name: w.ten_kho,
                                                code: `${w.ma_kho || w.id}`,
                                            },
                                        }))
                                    )
                            }
                            onSelect={(id, data, label, item) => {
                                form.setFieldValue("ma_kho", item.code);
                                setKeyAutoComplete(Utils.generateRandomString(3));
                            }}
                            onBlur={(id, data) => {
                                const warehouseList = form.getFieldValue("ma_khoan_muc")
                                    ? listWarehouse.filter(w =>
                                        projectwareHouses?.some(pw => pw.warehouseId === w.id)
                                    )
                                    : listWarehouse;
                                const warehouse = warehouseList.find(w => w.ma_kho === data);
                                if (warehouse) {
                                    form.setFieldValue("ma_kho", warehouse.ma_kho || warehouse.id);
                                } else {
                                    form.setFieldValue("ma_kho", '');
                                }
                            }}
                            placeholder="Chọn mã kho"
                            className=""
                            onChange={(input: string, data: string) => { form.setFieldsValue({ ma_kho: data }); }}
                            warning=""
                        />
                    </Form.Item>

                    <Form.Item label="Mã vật tư" name="ma_vat_tu">
                        <AutoCompleteCustom
                            id=""
                            keyElement={keyAutoComplete}
                            value={form.getFieldValue("ma_vat_tu")}
                            optionsList={products.map(w => ({
                                label: `${w.ma_vt || w.id} / ${w.ten_vt}`,
                                value: `${w.ma_vt || w.id}`,
                                item: {
                                    name: w.ten_vt,
                                    code: `${w.ma_vt || w.id}`,
                                },
                            }))}
                            onSelect={(id, data, label, item) => {
                                form.setFieldValue("ma_vat_tu", item.code);
                                setKeyAutoComplete(Utils.generateRandomString(3));
                            }}
                            onBlur={(id, data) => {
                                const product = products.find(w => w.ma_vt === data);
                                if (product) {
                                    form.setFieldValue("ma_vat_tu", product.ma_vt || product.id);
                                } else {
                                    form.setFieldValue("ma_vat_tu", '');
                                }
                            }}
                            placeholder="Chọn mã sản phẩm"
                            className=""
                            onChange={(input: string, data: string) => { form.setFieldsValue({ ma_vat_tu: data }); }}
                            warning=""
                        />
                    </Form.Item>



                    <Form.Item label="Mã vụ việc" name="ma_vu_viec">
                        <Input placeholder="Mã vụ việc" />
                    </Form.Item>

                    <Form.Item label="Mã khách hàng" name="ma_khach_hang">
                        <AutoCompleteCustom
                            id=""
                            keyElement={keyAutoComplete}
                            value={form.getFieldValue("ma_khach_hang")}
                            optionsList={nccList.map((customer) => ({
                                label: customer.ten_kh,
                                value: customer.ma_kh,
                                item: {
                                    name: customer.ma_kh,
                                    code: `${customer.ten_kh || customer.ma_kh}`,
                                },
                            }))}
                            onSelect={(id, data, label, item) => {
                                form.setFieldValue("ma_khach_hang", item.name);
                                setKeyAutoComplete(Utils.generateRandomString(3));
                            }}
                            onBlur={(id, data) => {
                                const selectedCustomer = nccList.find(
                                    (c) => c.ten_kh === data || c.ma_kh === data
                                );
                                if (selectedCustomer) {
                                    form.setFieldValue("ma_khach_hang", selectedCustomer.ma_kh);
                                } else {
                                    form.setFieldValue("ma_khach_hang", "");
                                }
                            }}
                            onChange={(input: string, data: string) => {
                                form.setFieldValue("ma_khach_hang", data);
                            }}
                            placeholder="Chọn khách hàng"
                            className=""
                            warning=""
                        />
                    </Form.Item>

                    <Form.Item label="ReportTemplateRecID" initialValue="598" name="reportTemplateRecID" hidden>
                        <Input placeholder="ReportTemplateRecID" />
                    </Form.Item>

                    <Form.Item>
                        <Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: 16 }}>
                                <Button type="primary" onClick={handleSave} loading={isLoading}>
                                    Lưu
                                </Button>
                            </div>
                        </Form.Item>
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};