/* eslint-disable import/order */
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { accountingInvoiceActions } from "@/store/accountingInvoice";
import { useAppSelector } from "@/store/hooks";
import { getLoading } from '@/store/loading';
import { RootState } from "@/store/types";
import { Button, Empty, Spin } from "antd";
import { useTranslation } from "react-i18next";
import { FilterModal } from "./components/FilterModal";

export const ProductsDiary: React.FC = () => {
    const dispatch = useDispatch();
    const pdfString = useAppSelector(
        (state: RootState) => state.accountingInvoice.pdfDataUriNhapXuat
    );
    const { t } = useTranslation();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const isLoading = useAppSelector(getLoading('BaoCaoChiTietNhapXuatVatTuRequest'));
    useEffect(() => {
        setIsModalVisible(true);
        dispatch(accountingInvoiceActions.getCustomers());

    }, []);

    return (
        <div>
            <Spin spinning={isLoading}>
                {isModalVisible ? (
                    <FilterModal
                        visible={isModalVisible}
                        onClose={() => setIsModalVisible(false)}
                    />
                ) : (
                    <>
                        {/* Button gọi lại modal */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginRight: 16, margin: 10, padding: 10, backgroundColor: '#fff' }}>
                            <h2 style={{ marginLeft: 16, marginBottom: 16 }}>Nhật ký vật tư, máy móc, CCDC</h2>
                            <Button type="primary" onClick={() => setIsModalVisible(true)}>
                                Tra cứu
                            </Button>
                        </div>

                        {/* Hiển thị PDF nếu có */}
                        {pdfString ? (
                            <iframe
                                src={`data:application/pdf;base64,${pdfString}`}
                                title="File Viewer"
                                width="100%"
                                height="1000px"
                                style={{ border: "none" }}
                            />
                        ) : (
                            <>
                                <Empty description={t('Không có dữ liệu')} />
                            </>
                        )}
                    </>
                )}
            </Spin>
        </div>
    );
};
