import CoffeeOutlined from "@ant-design/icons/CoffeeOutlined"
import HeartOutlined from "@ant-design/icons/HeartOutlined"
import QrcodeOutlined from "@ant-design/icons/QrcodeOutlined"
import { Button, Card, Divider, Space, Typography } from "antd"
import { useTranslation } from "react-i18next"

import { BuyMeACoffeeImage, TechcombankQrImage } from "src/assets/images"
import PageContainer from "src/components/shared/PageContainer"

const { Title, Text, Paragraph } = Typography

const SupportMePage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Title
            level={1}
            className="!text-4xl !font-bold !text-gray-800 dark:!text-gray-200 mb-4">
            <HeartOutlined className="text-red-500 mr-3" />
            {t("support_me_page.title")}
          </Title>
          <Paragraph className="!text-lg !text-gray-600 dark:!text-gray-300 max-w-2xl mx-auto">
            {t("support_me_page.description")}
          </Paragraph>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Buy Me a Coffee Section */}
          <Card
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 border rounded-xl dark:border-gray-700 dark:bg-gray-800"
            styles={{ body: { padding: "2rem" } }}>
            <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CoffeeOutlined className="text-3xl text-yellow-600 dark:text-yellow-400" />
              </div>

              <Title
                level={3}
                className="!text-gray-800 dark:!text-gray-200 mb-4">
                Buy Me a Coffee
              </Title>

              <Paragraph className="!text-gray-600 dark:!text-gray-300 mb-6">
                Support me with a coffee! Quick and easy way to show your
                appreciation.
              </Paragraph>

              {/* QR Code Placeholder */}
              <div className="bg-white p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 mb-6 mx-auto w-48 h-48 flex items-center justify-center">
                <div className="text-center">
                  <img src={BuyMeACoffeeImage} alt="" className="mx-auto" />
                </div>
              </div>

              <Space direction="vertical" className="w-full">
                <Button
                  type="primary"
                  size="large"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600"
                  icon={<CoffeeOutlined />}
                  href="https://coff.ee/minhchi1509"
                  target="_blank">
                  Buy Me a Coffee
                </Button>

                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Click the button or scan the QR code above
                </Text>
              </Space>
            </div>
          </Card>

          {/* Techcombank QR Section */}
          <Card
            className="shadow-lg hover:shadow-xl transition-shadow duration-300 border rounded-xl dark:border-gray-700 dark:bg-gray-800"
            styles={{ body: { padding: "2rem" } }}>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrcodeOutlined className="text-3xl text-green-600 dark:text-green-400" />
              </div>

              <Title
                level={3}
                className="!text-gray-800 dark:!text-gray-200 mb-4">
                Techcombank QR
              </Title>

              <Paragraph className="!text-gray-600 dark:!text-gray-300 mb-6">
                Chuyển khoản qua QR Code Techcombank. Nhanh chóng và tiện lợi!
              </Paragraph>

              {/* Techcombank QR Code Placeholder */}
              <div className="bg-white p-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 mb-6 mx-auto w-48 h-48 flex items-center justify-center">
                <div className="text-center">
                  <img src={TechcombankQrImage} alt="" className="mx-auto" />
                </div>
              </div>

              <Space direction="vertical" className="w-full" size="small">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <Text strong className="text-gray-700 dark:text-gray-300">
                    Ngân hàng:{" "}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    Techcombank
                  </Text>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <Text strong className="text-gray-700 dark:text-gray-300">
                    Chủ tài khoản:{" "}
                  </Text>
                  <Text className="text-gray-600 dark:text-gray-400">
                    NGUYEN MINH CHI
                  </Text>
                </div>

                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                  Quét mã QR để chuyển khoản nhanh chóng
                </Text>
              </Space>
            </div>
          </Card>
        </div>

        <Divider className="my-12" />

        {/* Thank You Section */}
        <Card className="text-center shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
          <Title level={4} className="!text-gray-800 dark:!text-gray-200 mb-4">
            {t("support_me_page.thank_you_title")}
          </Title>
          <Paragraph className="!text-gray-600 dark:!text-gray-300 max-w-2xl mx-auto">
            {t("support_me_page.thank_you_message")}
          </Paragraph>
          <div className="flex justify-center items-center gap-2 mt-4">
            <HeartOutlined className="text-red-500" />
            <Text className="text-gray-600 dark:text-gray-300">
              Made with love
            </Text>
            <HeartOutlined className="text-red-500" />
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

export default SupportMePage
