import React, { useEffect, useRef, useState } from 'react';

import { Button, Modal, Row, Spin, Typography } from 'antd';
import dayjs from 'dayjs';
import { LatLngExpression } from 'leaflet';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getActiveLoading } from '@/store/loading';
import { getModalVisible, hideModal } from '@/store/modal';
import {
  getCheckInPhoto,
  getSelectedCheckInDetail,
  getSelectedCheckInItem,
  timekeepingActions,
} from '@/store/timekeeping';
import Utils from '@/utils';

interface LocationMarkerProps {
  position: LatLngExpression | null;
  children: React.ReactNode;
}

const LocationMarker = ({ position, children }: LocationMarkerProps) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.floor(map.getMaxZoom() * 0.9));
    }
    // eslint-disable-next-line
  }, [position]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>{children}</Popup>
    </Marker>
  );
};

export const ImgWithLocationCheckIn = () => {
  const { t } = useTranslation(['common']);
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('accessToken');
  const dispatch = useAppDispatch();
  const chkInDtl = useAppSelector(getSelectedCheckInDetail());
  const chkInItem = useAppSelector(getSelectedCheckInItem());
  const photo = useAppSelector(getCheckInPhoto());
  const ckInTimeAt = Utils.convertISODateToLocalTime(chkInItem?.timeStamp);
  const visible = useAppSelector(getModalVisible('showLocationImgCheckIn'));
  const [location, setLocation] = useState<any>(null);
  const mapRef = useRef(null);
  const fetchingPhoto = useAppSelector(getActiveLoading('getCheckInPhoto'));

  useEffect(() => {
    setLocation(Utils.parseCheckInLocation(chkInItem?.location));
    if (chkInItem?.id) {
      dispatch(timekeepingActions.getCheckInPhoto({ checkInId: chkInItem?.id, accessToken }));
    }
    // eslint-disable-next-line
  }, [chkInItem]);

  const selftClose = () => {
    dispatch(hideModal({ key: 'showLocationImgCheckIn' }));
  };
  const hasCoordinates =
    Number.isFinite(Number(location?.latitude)) && Number.isFinite(Number(location?.longitude));

  return (
    <Modal title={chkInDtl?.name} open={visible} onCancel={selftClose} footer={null} width={902}>
      <Row style={{ marginBottom: 5, paddingLeft: 10 }}>
        <Typography.Text>
          {t('check_in_at', { time: '' })}
          <b>{dayjs(ckInTimeAt).format('HH:mm')}</b>
        </Typography.Text>
        {location?.address && <div style={{ width: '100%' }}>{location.address}</div>}
      </Row>
      <Row align="stretch">
        <div
          style={{
            flex: 1,
            width: 400,
            height: 405,
            marginRight: 10,
            borderWidth: 1,
            borderStyle: 'dotted',
            borderRadius: 8,
            padding: '5px 10px 10px 10px',
          }}
        >
          <Typography.Text style={{ fontWeight: 600 }}>{t('Location')}</Typography.Text>
          <div ref={mapRef} style={{ height: 'calc(100% - 20px)', width: '100%' }}>
            {hasCoordinates && (
              <MapContainer
                center={{ lat: Number(location.latitude), lng: Number(location.longitude) }}
                zoom={13}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={{ lat: Number(location.latitude), lng: Number(location.longitude) }}>
                  {location?.address || t('Name check in heare', { name: chkInDtl?.name })}
                </LocationMarker>
              </MapContainer>
            )}
          </div>
        </div>
        <Spin spinning={fetchingPhoto}>
          <div
            style={{
              width: 400,
              height: 400,
              borderWidth: 1,
              borderStyle: 'dotted',
              borderRadius: 8,
              padding: 10,
            }}
          >
            <Typography.Text style={{ fontWeight: 600 }}>{t('Photo')}</Typography.Text>
            {photo && <img src={photo} alt="NoPhoto" style={{ objectFit: 'contain' }} width={400} height={380} />}
          </div>
        </Spin>
      </Row>
      <div style={{ textAlign: 'right', marginTop: 15 }}>
        <Button onClick={selftClose}>{t('Close')}</Button>
      </div>
    </Modal>
  );
};
