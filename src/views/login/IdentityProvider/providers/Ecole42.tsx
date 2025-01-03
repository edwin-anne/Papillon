import React, { useState, useCallback, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import type { Screen } from "@/router/helpers/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, LocalAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/local/default-personalization";
import uuid from "@/utils/uuid-v4";
import { useTheme } from "@react-navigation/native";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";

const API_BASE_URL = "https://api.intra.42.fr/v2";
const CLIENT_ID = "u-s4t2ud-6c703ff3b5ae5d7ef133bce004759ef20c88497db5802a6a907004ae27b5fa36";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://localhost/callback"; // URL fictive

const Ecole42_Login: Screen<"Ecole42_Login"> = ({ navigation }) => {
  const theme = useTheme();
  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const fetchStudentInfo = useCallback(async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch student info");
    }

    const data = await response.json();
    return data;
  }, []);

  const handleLoginData = useCallback(async (code: string) => {
    setIsLoading(true);
    setLoadingText("Connexion en cours...");

    try {
      const tokenResponse = await fetch(`${API_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Token retrieval failed");
      }

      const { access_token } = await tokenResponse.json();
      setLoadingText("Récupération des informations...");

      const studentInfo = await fetchStudentInfo(access_token);

      const localAccount: LocalAccount = {
        authentication: undefined,
        instance: undefined,
        identityProvider: {
          identifier: "ecole_42",
          name: "École 42",
          rawData: studentInfo
        },
        localID: uuid(),
        service: AccountService.Local,
        isExternal: false,
        linkedExternalLocalIDs: [],
        name: `${studentInfo.first_name} ${studentInfo.last_name}`,
        studentName: {
          first: studentInfo.first_name,
          last: studentInfo.last_name,
        },
        className: studentInfo.campus.name,
        schoolName: "École 42",
        personalization: await defaultPersonalization({
          profilePictureB64: await convertImageToBase64(studentInfo.image.versions.small),
        }),
        identity: {}
      };

      createStoredAccount(localAccount);
      switchTo(localAccount);

      navigation.reset({
        index: 0,
        routes: [{ name: "AccountCreated" }],
      });
    } catch (error) {
      console.error("Error during login process:", error);
    } finally {
      setIsLoading(false);
    }
  }, [createStoredAccount, switchTo, navigation, fetchStudentInfo]);

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to Base64:", error);
      throw error;
    }
  };

  interface NavigationStateChangeEvent {
    url: string;
  }

  const handleNavigationStateChange = useCallback((event: NavigationStateChangeEvent) => {
    if (event.url.startsWith(REDIRECT_URI)) {
      const urlParams = new URLSearchParams(event.url.split("?")[1]);
      const code = urlParams.get("code");
      if (code) {
        handleLoginData(code);
      }
    }
  }, [handleLoginData]);

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            gap: 6,
          }}
        >
          <PapillonSpinner color={theme.colors.primary} size={50} strokeWidth={4} />
          <NativeText style={{ color: theme.colors.text, marginTop: 16 }}>
            {loadingText}
          </NativeText>
        </View>
      )}
      <WebView
        source={{
          uri: `${API_BASE_URL}/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`,
        }}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme.colors.background,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              gap: 6,
            }}
          >
            <PapillonSpinner color={theme.colors.primary} size={50} strokeWidth={4} />
            <NativeText style={{ color: theme.colors.text, marginTop: 16 }}>
              Chargement de la page...
            </NativeText>
          </View>
        )}
      />
    </View>
  );
};

export default Ecole42_Login;
