import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { Modal, Upload, Switch } from "antd";
import type { UploadProps } from "antd";
import {
  ProfileServiceProxy,
  UpdateProfilePictureInput,
} from "@api/generated/service-proxies";
import AppConsts from "../../../../../lib/app-consts";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { v4 as uuidv4 } from "uuid";

export type ChangeProfilePictureModalHandle = {
  show: (userId?: number) => void;
};

const ChangeProfilePictureModal = forwardRef<ChangeProfilePictureModalHandle>(
  (_props, ref) => {
    const profileService = useServiceProxy(ProfileServiceProxy, []);
    const token = abp?.auth?.getToken();
    const maxProfilePictureSizeInMB = abp?.setting?.getInt?.(
      "App.UserManagement.MaxProfilePictureSizeInMB",
    );
    const maxProfilePictureWidth = abp?.setting?.getInt?.(
      "App.UserManagement.MaxProfilePictureWidth",
    );
    const maxProfilePictureHeight = abp?.setting?.getInt?.(
      "App.UserManagement.MaxProfilePictureHeight",
    );

    const [visible, setVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [useGravatarProfilePicture, setUseGravatarProfilePicture] =
      useState(false);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const fileToken = uuidv4();

    // Cropper state
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
      null,
    );

    const show = (uid?: number) => {
      setUserId(uid);

      // Gravatar settings
      if (canUseGravatar()) {
        setUseGravatarProfilePicture(
          abp?.setting.getBoolean(
            "App.UserManagement.UseGravatarProfilePicture",
          ),
        );
      } else {
        setUseGravatarProfilePicture(false);
      }

      setVisible(true);
    };

    useImperativeHandle(ref, () => ({ show }));

    const canUseGravatar = (): boolean => {
      return abp?.setting?.getBoolean(
        "App.UserManagement.AllowUsingGravatarProfilePicture",
      );
    };

    const maxProfilePictureSizeInByte = (): number => {
      return maxProfilePictureSizeInMB * 1024 * 1024;
    };

    const uploadProps: UploadProps = {
      name: "file",
      action: `${AppConsts.remoteServiceBaseUrl}/Profile/UploadProfilePictureFile`,
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: false,
      showUploadList: false,
      accept: "image/jpeg,image/png",
      beforeUpload: (file) => {
        if (useGravatarProfilePicture) {
          return Upload.LIST_IGNORE;
        }

        if (file.size > maxProfilePictureSizeInByte()) {
          abp?.message?.warn?.(
            L("ProfilePicture_Warn_SizeLimit", [maxProfilePictureSizeInMB]),
          );
          return;
        }

        const objectUrl = URL.createObjectURL(file as Blob);
        updateCropperPicture(objectUrl);

        return false;
      },
    };

    const updateCropperPicture = (fileUrl: string) => {
      setImageSrc(fileUrl);
    };

    const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
      setCroppedAreaPixels(areaPixels);
    }, []);

    const handleAfterClose = () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
      }

      setImageSrc(null);
    };

    const getCroppedImageBlob = async (
      imageSrc: string,
      pixelCrop: Area,
    ): Promise<Blob> => {
      const image = new Image();
      image.src = imageSrc;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = maxProfilePictureWidth;
      canvas.height = maxProfilePictureHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        maxProfilePictureWidth,
        maxProfilePictureHeight,
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/jpeg");
      });
    };

    const updateProfilePictureToUseGravatar = async () => {
      const input = new UpdateProfilePictureInput();
      input.useGravatarProfilePicture = true;

      if (userId) {
        input.userId = userId;
      }
      await profileService.updateProfilePicture(input);
    };

    const updateProfilePictureWithUpload = async () => {
      if (!croppedAreaPixels) {
        throw new Error("Crop area is not set");
      }
      const croppedImage = await getCroppedImageBlob(
        imageSrc!,
        croppedAreaPixels,
      );

      // build form data
      const formData = new FormData();
      formData.append("file", croppedImage, "cropped.jpg");
      formData.append("FileType", "image/jpeg");
      formData.append("FileName", "ProfilePicture");
      formData.append("FileToken", fileToken);

      const res = await fetch(
        `${AppConsts.remoteServiceBaseUrl}/Profile/UploadProfilePictureFile`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }

      const input = new UpdateProfilePictureInput();
      input.useGravatarProfilePicture = false;
      input.fileToken = fileToken;

      if (userId) {
        input.userId = userId;
      }

      await profileService.updateProfilePicture(input);
      setImageSrc(null);
    };

    const handleSave = async () => {
      setSaving(true);

      try {
        if (useGravatarProfilePicture) {
          await updateProfilePictureToUseGravatar();
        } else {
          await updateProfilePictureWithUpload();
        }

        abp?.event?.trigger?.("profilePictureChanged");
        abp?.notify?.info?.(L("SavedSuccessfully"));
      } catch {
        abp?.notify?.error?.(L("SaveFailed"));
      } finally {
        setSaving(false);
        setVisible(false);
      }
    };

    return (
      <Modal
        title={L("ChangeProfilePicture")}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <button
            key="cancel"
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={() => setVisible(false)}
            disabled={saving}
          >
            {L("Cancel")}
          </button>,
          <button
            key="save"
            type="button"
            className="btn btn-primary fw-bold ms-3"
            onClick={() => void handleSave()}
            disabled={(!useGravatarProfilePicture && !imageSrc) || saving}
          >
            <i className="fa fa-save" />
            <span>{L("Save")}</span>
          </button>,
        ]}
        destroyOnHidden
        afterClose={handleAfterClose}
      >
        {canUseGravatar() && (
          <div className="mb-3">
            <label className="form-check form-check-custom form-check-solid py-1">
              <Switch
                checked={useGravatarProfilePicture}
                onChange={setUseGravatarProfilePicture}
              />
              <span className="ms-2">{L("UseGravatarProfilePicture")}</span>
            </label>
          </div>
        )}
        {!useGravatarProfilePicture && (
          <div>
            <Upload {...uploadProps}>
              <button type="button" className="btn btn-primary fw-bold">
                {L("SelectFile")}
              </button>
            </Upload>
            <p className="text-muted mt-2">
              <small>
                {L("ProfilePicture_Change_Info", [maxProfilePictureSizeInMB])}
              </small>
            </p>
          </div>
        )}
        {
          <div
            style={{
              position: "relative",
              width: "100%",
              height: !useGravatarProfilePicture && imageSrc ? 350 : 0,
              background: "#333",
              borderRadius: 0,
              touchAction: "none",
              visibility:
                !useGravatarProfilePicture && imageSrc ? "visible" : "hidden",
            }}
          >
            <Cropper
              image={imageSrc!}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropSize={{
                width: maxProfilePictureWidth,
                height: maxProfilePictureHeight,
              }}
              zoomWithScroll={true}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={true}
            />
          </div>
        }
      </Modal>
    );
  },
);

export default ChangeProfilePictureModal;
