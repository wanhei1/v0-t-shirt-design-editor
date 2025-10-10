"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Calendar, Edit, Save, X } from "lucide-react";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const { translate } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const resetFormToUser = () => {
    if (!user) {
      return;
    }
    setEditForm({
      username: user.username,
      email: user.email,
    });
  };

  const handleEditToggle = () => {
    resetFormToUser();
    setIsEditing((prev) => !prev);
    setMessage(null);
  };

  const handleSave = async () => {
    try {
      await updateProfile(editForm);

      setMessage({
        type: "success",
        text: translate({ zh: "资料更新成功！", en: "Profile updated successfully!" }),
      });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: translate({ zh: "更新失败，请重试", en: "Update failed, please try again" }),
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      translate({ zh: "zh-CN", en: "en-US" }),
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {translate({ zh: "个人资料", en: "Profile" })}
            </h1>
            <p className="text-muted-foreground">
              {translate({ zh: "管理您的账户信息和偏好设置", en: "Manage your account information and preferences" })}
            </p>
          </div>

          {message && (
            <Alert
              className={`mb-6 ${
                message.type === "error" ? "border-red-500" : "border-green-500"
              }`}
            >
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* 基本信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {translate({ zh: "基本信息", en: "Basic Information" })}
                </CardTitle>
                <CardDescription>
                  {translate({ zh: "您的账户基本信息", en: "Your account basic information" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 头像 */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {user ? getInitials(user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user?.username}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>

                <Separator />

                {/* 可编辑的信息 */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">
                      {translate({ zh: "用户名", en: "Username" })}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="username"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.username}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {translate({ zh: "邮箱", en: "Email" })}
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{user?.email}</span>
                      </div>
                    )}
                  </div>

                  {user?.created_at && (
                    <div className="space-y-2">
                      <Label>
                        {translate({ zh: "注册时间", en: "Registration Date" })}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 编辑按钮 */}
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {translate({ zh: "保存", en: "Save" })}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleEditToggle}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        {translate({ zh: "取消", en: "Cancel" })}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      {translate({ zh: "编辑资料", en: "Edit Profile" })}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 账户操作卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {translate({ zh: "账户操作", en: "Account Actions" })}
                </CardTitle>
                <CardDescription>
                  {translate({ zh: "管理您的账户设置", en: "Manage your account settings" })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {translate({ zh: "设计历史", en: "Design History" })}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {translate({ zh: "查看您创建的所有T恤设计", en: "View all your T-shirt designs" })}
                  </p>
                  <Button variant="outline" disabled>
                    {translate({ zh: "即将推出", en: "Coming Soon" })}
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {translate({ zh: "订单历史", en: "Order History" })}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {translate({ zh: "查看您的订购历史和状态", en: "View your order history and status" })}
                  </p>
                  <Button variant="outline" disabled>
                    {translate({ zh: "即将推出", en: "Coming Soon" })}
                  </Button>
                </div>

                <Separator />

                <div className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                  <h4 className="font-semibold text-red-800 mb-2">
                    {translate({ zh: "危险操作", en: "Danger Zone" })}
                  </h4>
                  <p className="text-sm text-red-600 mb-3">
                    {translate({ zh: "登出将清除您的本地会话", en: "Logging out will clear your local session" })}
                  </p>
                  <Button
                    variant="destructive"
                    onClick={logout}
                    className="w-full"
                  >
                    {translate({ zh: "登出账户", en: "Log Out" })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
